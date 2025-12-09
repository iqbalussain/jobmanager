import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting hourly high-priority check...");
    
    // Query high-priority pending jobs due within 72 hours
    const now = new Date();
    const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    
    const { data: jobs, error: jobsError } = await supabase
      .from("job_orders")
      .select(`
        id,
        job_order_number,
        job_order_details,
        due_date,
        created_by,
        salesman_id,
        designer_id,
        customer:customers(name)
      `)
      .eq("priority", "high")
      .eq("status", "pending")
      .lte("due_date", in72Hours.toISOString().split("T")[0]);
    
    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      throw jobsError;
    }
    
    console.log(`Found ${jobs?.length || 0} high-priority pending jobs`);
    
    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No high-priority jobs found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    let notificationsCreated = 0;
    
    for (const job of jobs) {
      // Check for existing notification in last 6 hours (de-dup)
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("job_id", job.id)
        .eq("type", "high_priority_pending")
        .gte("created_at", sixHoursAgo.toISOString())
        .limit(1);
      
      if (existingNotif && existingNotif.length > 0) {
        console.log(`Skipping job ${job.job_order_number} - notification already sent within 6h`);
        continue;
      }
      
      // Get users to notify (creator, salesman, designer)
      const usersToNotify = new Set<string>();
      if (job.created_by) usersToNotify.add(job.created_by);
      if (job.salesman_id) usersToNotify.add(job.salesman_id);
      if (job.designer_id) usersToNotify.add(job.designer_id);
      
      // Also notify all admins and managers
      const { data: adminUsers } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["admin", "manager"]);
      
      adminUsers?.forEach((u) => usersToNotify.add(u.id));
      
      const customerName = (job.customer as any)?.name || "Unknown Customer";
      const message = `High priority job #${job.job_order_number} (${customerName}) is pending and due within 72 hours!`;
      
      // Create notifications for each user
      const notifications = Array.from(usersToNotify).map((userId) => ({
        user_id: userId,
        job_id: job.id,
        type: "high_priority_pending",
        message,
        payload: {
          job_order_number: job.job_order_number,
          due_date: job.due_date,
          customer_name: customerName,
        },
      }));
      
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);
      
      if (insertError) {
        console.error(`Error inserting notifications for job ${job.job_order_number}:`, insertError);
      } else {
        notificationsCreated += notifications.length;
        console.log(`Created ${notifications.length} notifications for job ${job.job_order_number}`);
      }
    }
    
    console.log(`Hourly check complete. Created ${notificationsCreated} notifications.`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${notificationsCreated} notifications`,
        jobsChecked: jobs.length,
        notificationsCreated 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in hourly check:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
