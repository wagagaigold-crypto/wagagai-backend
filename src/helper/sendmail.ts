import nodemailer from "nodemailer";
import { credentials } from "../configs/credentials";
import ejs from "ejs";

export const SendMail = async (
  templatePath: string,
  subject: string,
  recipient: string,
  data: Record<string, any>
) => {
  const {
    emailHost: host,
    emailPort: port,
    emailAddress: user,
    emailPassword: pass,
  } = credentials;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false otherwise
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  // Render the template safely with await
  const html = await ejs.renderFile(templatePath, data).catch((err) => {
    console.error("EJS render error:", err);
    throw new Error("Template rendering failed");
  });

  const mailOptions = {
    from: `UNIQ <${user}>`,
    to: recipient,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Email send failed");
  }
};
