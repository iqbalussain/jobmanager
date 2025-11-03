
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  jobOrderNumber: string;
  customerName: string;
  jobTitle: string;
  priority: string;
  salesman: string;
  dueDate: string;
  notificationType: 'email' | 'whatsapp' | 'both';
  recipientEmail?: string;
  recipientPhone?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      jobOrderNumber, 
      customerName, 
      jobTitle, 
      priority, 
      salesman, 
      dueDate,
      notificationType,
      recipientEmail,
      recipientPhone
    }: NotificationRequest = await req.json();

    console.log("Sending notification for job order:", jobOrderNumber);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the email attempt
    const logData: {
      recipient_email: string;
      subject: string;
      content: string;
      email_type: string;
      sent_at: string;
      status: string;
      error_message?: string;
    } = {
      recipient_email: recipientEmail || 'unknown',
      subject: `New Job Order Approval Required - ${jobOrderNumber}`,
      content: `Job Order: ${jobOrderNumber}, Customer: ${customerName}, Priority: ${priority}`,
      email_type: 'job_notification',
      sent_at: new Date().toISOString(),
      status: 'pending'
    };

    // Send email notification
    if (notificationType === 'email' || notificationType === 'both') {
      if (recipientEmail) {
        try {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%); border-radius: 10px;">
              <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">🚀 New Job Order Approval Required</h1>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h2 style="color: #ef4444; margin-bottom: 15px;">Job Order Details</h2>
                  <p><strong>Job Order Number:</strong> ${jobOrderNumber}</p>
                  <p><strong>Customer:</strong> ${customerName}</p>
                  <p><strong>Job Title:</strong> ${jobTitle}</p>
                  <p><strong>Priority:</strong> <span style="color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'};">${priority.toUpperCase()}</span></p>
                  <p><strong>Salesman:</strong> ${salesman}</p>
                  <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0; color: #1e40af;"><strong>Action Required:</strong> Please review and approve this job order in the system.</p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://yourapp.com" style="background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Job Order</a>
                </div>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: "Job Manager <notifications@resend.dev>",
            to: [recipientEmail],
            subject: logData.subject,
            html: emailHtml,
          });

          logData.status = 'sent';
          console.log("Email notification sent successfully");
        } catch (emailError) {
          logData.status = 'failed';
          logData.error_message = emailError instanceof Error ? emailError.message : String(emailError);
          console.error("Email sending failed:", emailError);
        }

        // Try to log to database (will fail gracefully if tables don't exist)
        try {
          await supabase.from('email_logs').insert(logData);
        } catch (dbError) {
          console.log("Database logging skipped (table may not exist):", dbError instanceof Error ? dbError.message : String(dbError));
        }
      }
    }

    // WhatsApp notification (placeholder for future implementation)
    if (notificationType === 'whatsapp' || notificationType === 'both') {
      if (recipientPhone) {
        const whatsappMessage = `🚀 *New Job Order Approval Required*

*Job Order Number:* ${jobOrderNumber}
*Customer:* ${customerName}
*Job Title:* ${jobTitle}
*Priority:* ${priority.toUpperCase()}
*Salesman:* ${salesman}
*Due Date:* ${dueDate}

Please review and approve this job order in the system.`;

        // For now, just log the message. In production, integrate with WhatsApp Business API
        console.log("WhatsApp message would be sent:", whatsappMessage);
        console.log("To phone number:", recipientPhone);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
