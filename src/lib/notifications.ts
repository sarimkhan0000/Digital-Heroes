import { Resend } from 'resend';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendTransactionalEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Digital Heroes <onboarding@resend.dev>';

  if (!apiKey || apiKey.includes('placeholder')) {
    console.info(`[Resend Sandbox Log] To: ${to} | Subject: ${subject}`);
    return { sent: false, sandboxLogged: true };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { sent: true, id: result.data?.id };
  } catch (err) {
    console.error('Resend email dispatch error:', err);
    return { sent: false, error: err };
  }
}