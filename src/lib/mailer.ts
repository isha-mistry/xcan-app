import nodemailer from "nodemailer";
import type { SendMailOptions as NodemailerSendMailOptions } from "nodemailer";

const transportOptions: any = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
};

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transportOptions.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

const transporter = nodemailer.createTransport(transportOptions);

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: NodemailerSendMailOptions["attachments"];
}

/**
 * Send an email using nodemailer.
 * Silently logs errors instead of throwing — email failures should not
 * break the main request flow.
 */
export async function sendMail({
  to,
  subject,
  html,
  attachments,
}: SendMailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(
        "[mailer] SMTP credentials not fully configured (missing USER or PASS) — skipping email send.",
      );
      return false;
    }

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Lampros DAO"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log(`[mailer] Email sent to ${to}: "${subject}"`);
    return true;
  } catch (error) {
    console.error("[mailer] Failed to send email:", error);
    return false;
  }
}
