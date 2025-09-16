import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string) {
  return await resend.emails.send({
    from: 'louisrouanet75@resend.dev',
    to,
    subject: 'Bienvenue !',
    html: `<h1>Merci de vous être inscrit</h1><p>Nous sommes ravis de vous accueillir.</p>`,
  });
}
