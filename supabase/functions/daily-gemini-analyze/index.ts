/**
 * Daily Gemini Analyzer - Runs daily at 06:00 server time
 * 
 * SECURITY NOTE: GEMINI_API_KEY must only be used server-side.
 * Set GEMINI_API_KEY in server env; never expose to client.
 * 
 * Manual run: POST to /functions/v1/daily-gemini-analyze
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  stuck_jobs: Array<{ job_id: string; reason: string }>;
  clusters: Array<{ name: string; count: number }>;
  checklist: Array<{ id: string; text: string; actionable: boolean; done?: boolean }>;
  clients: Array<{ client_name: string; note: string }>;
}

async function callGemini(prompt: string, apiKey: string): Promise<AnalysisResult> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Exponential backoff
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.status === 429) {
        console.log(`Rate limited, attempt ${attempt + 1}/${maxRetries}`);
        lastError = new Error("Rate limited");
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textContent) {
        throw new Error("No content in Gemini response");
      }

      // Parse the JSON response
      const parsed = JSON.parse(textContent);
      return parsed as AnalysisResult;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Gemini call attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("Failed to call Gemini after retries");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    // Check for cron secret header (for scheduled invocations)
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("authorization");
    const cronHeader = req.headers.get("x-cron-secret");
    
    // Allow if: has valid JWT auth OR has valid cron secret
    const hasCronAuth = cronSecret && cronHeader === cronSecret;
    const hasJwtAuth = authHeader?.startsWith("Bearer ");
    
    if (!hasCronAuth && !hasJwtAuth) {
      console.error("Unauthorized: Missing valid authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured. Set it in Supabase secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting daily Gemini analysis...");

    // Query relevant jobs
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const { data: jobs, error: jobsError } = await supabase
      .from("job_orders")
      .select(`
        id,
        job_order_number,
        job_order_details,
        status,
        priority,
        due_date,
        updated_at,
        created_at,
        branch,
        customer:customers(name),
        designer:profiles!job_orders_designer_id_fkey(full_name),
        salesman:profiles!job_orders_salesman_id_fkey(full_name)
      `)
      .neq("status", "completed")
      .neq("status", "invoiced")
      .or(`priority.eq.high,due_date.lte.${in7Days.toISOString().split("T")[0]},updated_at.lte.${threeDaysAgo.toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(200);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      throw jobsError;
    }

    console.log(`Found ${jobs?.length || 0} relevant jobs for analysis`);

    if (!jobs || jobs.length === 0) {
      // Create empty checklist for today
      const emptyResult: AnalysisResult = {
        stuck_jobs: [],
        clusters: [],
        checklist: [{ id: "1", text: "No urgent jobs today - review upcoming deadlines", actionable: true }],
        clients: [],
      };

      const { data: insertedChecklist, error: insertError } = await supabase
        .from("daily_checklists")
        .insert({
          date: now.toISOString().split("T")[0],
          items: emptyResult,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, checklist: insertedChecklist }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt for Gemini
    const jobsSummary = jobs.map((job) => {
      const customerName = (job.customer as any)?.name || "Unknown";
      const designerName = (job.designer as any)?.full_name || "Unassigned";
      const salesmanName = (job.salesman as any)?.full_name || "Unassigned";
      const daysSinceUpdate = Math.floor((now.getTime() - new Date(job.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: job.id,
        number: job.job_order_number,
        status: job.status,
        priority: job.priority,
        customer: customerName,
        designer: designerName,
        salesman: salesmanName,
        due_date: job.due_date,
        days_since_update: daysSinceUpdate,
        branch: job.branch,
        details: job.job_order_details?.substring(0, 100),
      };
    });

    const prompt = `Analyze these ${jobs.length} job orders and provide operational insights.

Jobs data:
${JSON.stringify(jobsSummary, null, 2)}

Today's date: ${now.toISOString().split("T")[0]}

Provide analysis in this exact JSON structure:
{
  "stuck_jobs": [
    {"job_id": "uuid", "reason": "Short reason why it's stuck (max 15 words)"}
  ],
  "clusters": [
    {"name": "Issue category name", "count": 5}
  ],
  "checklist": [
    {"id": "1", "text": "Specific actionable task for today", "actionable": true}
  ],
  "clients": [
    {"client_name": "Client Name", "note": "Why they need follow-up (max 20 words)"}
  ]
}

Guidelines:
- Identify stuck jobs: not updated in 3+ days, overdue, or high priority pending
- Cluster issues into categories like: Design delay, Client hold, Materials pending, Resource shortage, Approval needed
- Generate 5 actionable checklist items for ops team today - be specific with job numbers
- Highlight top 3-5 clients needing follow-up with reason
- Keep all text concise and actionable`;

    console.log("Calling Gemini API...");
    const analysisResult = await callGemini(prompt, geminiApiKey);
    console.log("Gemini analysis complete");

    // Add done: false to all checklist items
    analysisResult.checklist = analysisResult.checklist.map((item, idx) => ({
      ...item,
      id: item.id || String(idx + 1),
      done: false,
    }));

    // Save to daily_checklists
    const todayDate = now.toISOString().split("T")[0];
    
    // Check if today's checklist already exists
    const { data: existing } = await supabase
      .from("daily_checklists")
      .select("id")
      .eq("date", todayDate)
      .limit(1);

    let savedChecklist;
    if (existing && existing.length > 0) {
      // Update existing
      const { data, error } = await supabase
        .from("daily_checklists")
        .update({ items: analysisResult })
        .eq("id", existing[0].id)
        .select()
        .single();
      
      if (error) throw error;
      savedChecklist = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("daily_checklists")
        .insert({
          date: todayDate,
          items: analysisResult,
        })
        .select()
        .single();
      
      if (error) throw error;
      savedChecklist = data;
    }

    console.log("Daily checklist saved:", savedChecklist.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checklist: savedChecklist,
        summary: {
          stuckJobsCount: analysisResult.stuck_jobs.length,
          clustersCount: analysisResult.clusters.length,
          checklistItems: analysisResult.checklist.length,
          clientsCount: analysisResult.clients.length,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in daily analysis:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
