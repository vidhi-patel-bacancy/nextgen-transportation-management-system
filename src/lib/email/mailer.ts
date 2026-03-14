import nodemailer from "nodemailer";

interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const portValue = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !portValue || !user || !pass) {
    throw new Error("Missing SMTP configuration in environment variables.");
  }

  const port = Number(portValue);
  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a number.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendEmail(payload: MailPayload) {
  const from = process.env.MAIL_FROM;
  if (!from) {
    throw new Error("Missing MAIL_FROM environment variable.");
  }

  const client = getTransporter();
  await client.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

export function getAppBaseUrl() {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

export function isSandboxSmtp() {
  const host = process.env.SMTP_HOST?.toLowerCase() ?? "";
  return host.includes("sandbox.smtp.mailtrap.io");
}
