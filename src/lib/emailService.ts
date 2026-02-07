import { supabase } from './supabase';

interface EmailNotification {
    type: 'delivery_set' | 'request_approved' | 'request_rejected';
    orderId: string;
    customerEmail: string;
    deliveryDate?: string;
    adminResponse?: string;
    orderNumber?: string;
}

/**
 * Queue an email notification for delivery date updates
 * Emails are stored in the email_queue table and will be processed by Supabase
 */
export async function queueDeliveryEmail(notification: EmailNotification) {
    const { type, orderId, customerEmail, deliveryDate, adminResponse, orderNumber } = notification;

    let subject = '';
    let htmlBody = '';
    let textBody = '';

    // Generate email content based on type
    switch (type) {
        case 'delivery_set':
            subject = 'Your Order Delivery Date Has Been Scheduled';
            textBody = `Hello,\n\nYour order ${orderNumber || orderId.slice(0, 8)} has been scheduled for delivery on ${new Date(deliveryDate!).toLocaleDateString()}.\n\nThank you!`;
            htmlBody = generateDeliverySetEmail(orderId, orderNumber, deliveryDate!);
            break;

        case 'request_approved':
            subject = 'Your Delivery Date Change Request Was Approved';
            textBody = `Hello,\n\nYour delivery date change request for order ${orderNumber || orderId.slice(0, 8)} has been approved. New delivery date: ${new Date(deliveryDate!).toLocaleDateString()}.\n\n${adminResponse ? `Admin response: ${adminResponse}\n\n` : ''}Thank you!`;
            htmlBody = generateRequestApprovedEmail(orderId, orderNumber, deliveryDate!, adminResponse);
            break;

        case 'request_rejected':
            subject = 'Update on Your Delivery Date Change Request';
            textBody = `Hello,\n\nYour delivery date change request for order ${orderNumber || orderId.slice(0, 8)} could not be accommodated.\n\n${adminResponse ? `Reason: ${adminResponse}\n\n` : ''}Thank you for your understanding.`;
            htmlBody = generateRequestRejectedEmail(orderId, orderNumber, adminResponse);
            break;
    }

    // Insert email into queue
    const { error } = await supabase.from('email_queue').insert({
        to_email: customerEmail,
        subject,
        html_body: htmlBody,
        text_body: textBody,
        email_type: type,
        order_id: orderId,
        status: 'pending',
    });

    if (error) {
        console.error('Error queuing email:', error);
        throw error;
    }

    return { success: true };
}

function generateDeliverySetEmail(orderId: string, orderNumber: string | undefined, deliveryDate: string): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #f97316 50%, #eab308 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .date-box { background: white; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Delivery Date Scheduled</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Great news! Your order <strong>${orderNumber || '#' + orderId.slice(0, 8)}</strong> has been scheduled for delivery.</p>
            
            <div class="date-box">
              <strong>📅 Delivery Date:</strong><br>
              <span style="font-size: 18px; color: #f97316;">${new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            
            <p>Please ensure someone is available to receive the delivery on this date.</p>
            <p>If you need to request a change, you can do so from your customer dashboard.</p>
            
            <div class="footer">
              <p>Thank you for your order!</p>
              <p style="font-size: 12px; color: #999;">This is an automated message.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateRequestApprovedEmail(orderId: string, orderNumber: string | undefined, deliveryDate: string, adminResponse?: string): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .date-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .response-box { background: #ecfdf5; border: 1px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Request Approved</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Good news! Your delivery date change request for order <strong>${orderNumber || '#' + orderId.slice(0, 8)}</strong> has been approved.</p>
            
            <div class="date-box">
              <strong>📅 New Delivery Date:</strong><br>
              <span style="font-size: 18px; color: #10b981;">${new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            
            ${adminResponse ? `
              <div class="response-box">
                <strong>Admin Response:</strong><br>
                ${adminResponse}
              </div>
            ` : ''}
            
            <p>Your order will now be delivered on the new date. Thank you for your patience!</p>
            
            <div class="footer">
              <p>Thank you for choosing us!</p>
              <p style="font-size: 12px; color: #999;">This is an automated message.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateRequestRejectedEmail(orderId: string, orderNumber: string | undefined, adminResponse?: string): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .response-box { background: #fef2f2; border: 1px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Request Update</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We've reviewed your delivery date change request for order <strong>${orderNumber || '#' + orderId.slice(0, 8)}</strong>.</p>
            
            <p>Unfortunately, we're unable to accommodate your requested change at this time.</p>
            
            ${adminResponse ? `
              <div class="response-box">
                <strong>Reason:</strong><br>
                ${adminResponse}
              </div>
            ` : ''}
            
            <p>Your original delivery date remains unchanged. If you have questions, please contact us.</p>
            
            <div class="footer">
              <p>We appreciate your understanding!</p>
              <p style="font-size: 12px; color: #999;">This is an automated message.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
