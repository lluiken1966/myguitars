import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "465"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    return transporter;
}

export async function sendPasswordResetEmail(
    to: string,
    resetUrl: string
): Promise<void> {
    const transport = getTransporter();

    await transport.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: "Password Reset — MyGuitars",
        text: [
            "You requested a password reset for your MyGuitars account.",
            "",
            "Click the link below to reset your password:",
            "",
            resetUrl,
            "",
            "This link expires in 1 hour.",
            "",
            "If you did not request this, you can safely ignore this email.",
        ].join("\n"),
    });
}
