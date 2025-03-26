import twilio from "twilio";
import { createTransport } from "nodemailer";
import { SMTP_FROM_MAIL, SMTP_PASSWORD, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../config/index.js";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function sendSMS(to, body) {
    try {
        const { sid } = await client.messages.create({
            body,
            from: "+1 2023357408",
            to
        });

        return !!sid;
    } catch (error) {
        console.error("Error sending message:", error);
        return false;
    }
}


const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: SMTP_FROM_MAIL,
        pass: SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export async function sendMail({ to, subject, text, html = null } = {}) {
    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM_MAIL,
            to,
            subject,
            text,
            html,
        });

        console.log("Mail sent:", info);
        return true;
    } catch (error) {
        console.error("Mail error:", error);
        return false;
    }
}
