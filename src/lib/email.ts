import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@prodigyos.app',
      to,
      subject,
      text,
    });
    console.log('[email] Sent successfully:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[email] Failed to send:', error);
    return { success: false, error: error.message };
  }
}
