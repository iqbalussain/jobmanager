
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
  createdBy?: string;
  jobOrderDetails?: string;
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
      recipientPhone,
      createdBy,
      jobOrderDetails
    }: NotificationRequest = await req.json();

    console.log("Sending notification for job order:", jobOrderNumber);

    // Send email notification
    if (notificationType === 'email' || notificationType === 'both') {
      // Always include the specified email addresses
      const emailRecipients = [
        'aqeeb@printwavesoman.com',
        'account@printwavesoman.com'
      ];
      
      // Add the specific recipient if provided
      if (recipientEmail) {
        emailRecipients.push(recipientEmail);
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">🚀 New Job Order Approval Required</h1>
            
            <!-- Client Name Prominently Displayed -->
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">CLIENT: ${customerName}</h2>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #ef4444; margin-bottom: 15px;">Job Order Details</h2>
              <p><strong>Job Order Number:</strong> ${jobOrderNumber}</p>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Job Title:</strong> ${jobTitle}</p>
              <p><strong>Priority:</strong> <span style="color: ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'};">${priority.toUpperCase()}</span></p>
              <p><strong>Salesman:</strong> ${salesman}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
              <p><strong>Created By:</strong> ${createdBy || 'Unknown'}</p>
              ${jobOrderDetails ? `<p><strong>Details:</strong> ${jobOrderDetails}</p>` : ''}
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
        to: emailRecipients,
        subject: `🚀 New Job Order Approval Required - ${jobOrderNumber} (${customerName})`,
        html: emailHtml,
      });

      console.log("Email notifications sent successfully to:", emailRecipients);
    }

    // WhatsApp notification (placeholder for future implementation)
    if (notificationType === 'whatsapp' || notificationType === 'both') {
      if (recipientPhone) {
        const whatsappMessage = `🚀 *New Job Order Approval Required*

🏢 *CLIENT: ${customerName.toUpperCase()}*

*Job Order Number:* ${jobOrderNumber}
*Customer:* ${customerName}
*Job Title:* ${jobTitle}
*Priority:* ${priority.toUpperCase()}
*Salesman:* ${salesman}
*Due Date:* ${dueDate}
*Created By:* ${createdBy || 'Unknown'}

Please review and approve this job order in the system.`;

        // For now, just log the message. In production, integrate with WhatsApp Business API
        console.log("WhatsApp message would be sent:", whatsappMessage);
        console.log("To phone number:", recipientPhone);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent successfully",
        emailsSent: notificationType === 'email' || notificationType === 'both'
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
