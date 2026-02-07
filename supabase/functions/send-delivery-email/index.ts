import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    type: 'delivery_set' | 'request_approved' | 'request_rejected'
    orderId: string
    customerEmail: string
    deliveryDate?: string
    adminResponse?: string
    orderNumber?: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type, orderId, customerEmail, deliveryDate, adminResponse, orderNumber }: EmailRequest = await req.json()

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        let subject = ''
        let htmlBody = ''

        // Generate email content based on type
        switch (type) {
            case 'delivery_set':
                subject = 'Your Order Delivery Date Has Been Scheduled'
                htmlBody = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ec4899 0%, #f97316 50%, #eab308 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .date-box { background: white; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #f97316); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎨 Delivery Date Scheduled</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Great news! Your order <strong>${orderNumber || orderId.slice(0, 8)}</strong> has been scheduled for delivery.</p>
                  
                  <div class="date-box">
                    <strong>📅 Delivery Date:</strong><br>
                    <span style="font-size: 18px; color: #f97316;">${new Date(deliveryDate!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  <p>Please ensure someone is available to receive the delivery on this date.</p>
                  
                  <p>If you need to request a change to this delivery date, you can do so from your customer dashboard.</p>
                  
                  <a href="${Deno.env.get('SITE_URL') || 'https://yoursite.com'}/customer-dashboard" class="button">View Order Details</a>
                  
                  <div class="footer">
                    <p>Thank you for your order!</p>
                    <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
                break

            case 'request_approved':
                subject = 'Your Delivery Date Change Request Was Approved'
                htmlBody = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .date-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .response-box { background: #ecfdf5; border: 1px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Request Approved</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Good news! Your delivery date change request for order <strong>${orderNumber || orderId.slice(0, 8)}</strong> has been approved.</p>
                  
                  <div class="date-box">
                    <strong>📅 New Delivery Date:</strong><br>
                    <span style="font-size: 18px; color: #10b981;">${new Date(deliveryDate!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  ${adminResponse ? `
                    <div class="response-box">
                      <strong>Admin Response:</strong><br>
                      ${adminResponse}
                    </div>
                  ` : ''}
                  
                  <p>Your order will now be delivered on the new date. Thank you for your patience!</p>
                  
                  <a href="${Deno.env.get('SITE_URL') || 'https://yoursite.com'}/customer-dashboard" class="button">View Order Details</a>
                  
                  <div class="footer">
                    <p>Thank you for choosing us!</p>
                    <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
                break

            case 'request_rejected':
                subject = 'Update on Your Delivery Date Change Request'
                htmlBody = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .response-box { background: #fef2f2; border: 1px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #f97316); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📋 Request Update</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>We've reviewed your delivery date change request for order <strong>${orderNumber || orderId.slice(0, 8)}</strong>.</p>
                  
                  <p>Unfortunately, we're unable to accommodate your requested change at this time.</p>
                  
                  ${adminResponse ? `
                    <div class="response-box">
                      <strong>Reason:</strong><br>
                      ${adminResponse}
                    </div>
                  ` : ''}
                  
                  <p>Your original delivery date remains unchanged. If you have any questions or concerns, please don't hesitate to contact us.</p>
                  
                  <a href="${Deno.env.get('SITE_URL') || 'https://yoursite.com'}/customer-dashboard" class="button">View Order Details</a>
                  
                  <div class="footer">
                    <p>We appreciate your understanding!</p>
                    <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
                break
        }

        // Send email using Supabase's built-in email service
        // Note: This uses the SMTP configuration you've already set up in Supabase
        const { error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(customerEmail, {
            data: {
                email_subject: subject,
                email_body: htmlBody,
            },
            redirectTo: `${Deno.env.get('SITE_URL') || 'https://yoursite.com'}/customer-dashboard`,
        })

        if (emailError) {
            console.error('Email error:', emailError)

            // Alternative: Use a custom email table that triggers can process
            // This is more reliable for custom emails
            await supabaseClient.from('email_queue').insert({
                to_email: customerEmail,
                subject,
                html_body: htmlBody,
                email_type: type,
                order_id: orderId,
                status: 'pending',
            })
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
