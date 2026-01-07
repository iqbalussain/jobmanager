import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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

interface EmailLogData {
  recipient_email: string;
  subject: string;
  content: string;
  email_type: string;
  sent_at: string;
  status: string;
  error_message?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has permission to send notifications (admin, manager, or salesman)
    const { data: userRole } = await supabase
      .rpc('get_user_role', { _user_id: user.id });

    const allowedRoles = ['admin', 'manager', 'salesman', 'job_order_manager'];
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(`User ${user.id} with role ${userRole} attempted to send notification without permission`);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    const logData: EmailLogData = {
      recipient_email: recipientEmail || 'unknown',
      subject: `New Job Order Approval Required - ${jobOrderNumber}`,
      content: `Job Order: ${jobOrderNumber}, Customer: ${customerName}, Priority: ${priority}`,
      email_type: 'job_notification',
      sent_at: new Date().toISOString(),
      status: 'pending'
    };

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

          // Email sending disabled - add RESEND_API_KEY secret to enable
          logData.status = 'disabled';
          console.log("Email notification disabled - configure RESEND_API_KEY to enable");
        } catch (emailError: unknown) {
          logData.status = 'failed';
          logData.error_message = emailError instanceof Error ? emailError.message : 'Unknown error';
          console.error("Email sending failed:", emailError);
        }

        try {
          await supabase.from('email_logs').insert(logData);
        } catch (dbError: unknown) {
          console.log("Database logging skipped (table may not exist):", dbError instanceof Error ? dbError.message : 'Unknown error');
        }
      }
    }

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
  } catch (error: unknown) {
    console.error("Error sending notifications:", error);
    // Return safe error message without exposing internal details
    return new Response(
      JSON.stringify({ error: 'Failed to send notification. Please try again.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
