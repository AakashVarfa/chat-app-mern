import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: check Gmail connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer configuration error:", error.message);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"ChatApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "ChatApp - Email Verification OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background-color: #ffffff;
        ">

          <h2 style="text-align: center;">
            Welcome to ChatApp
          </h2>

          <p>
            Thank you for creating an account with ChatApp.
          </p>

          <p>
            Your email verification OTP is:
          </p>

          <h1 style="
            text-align: center;
            letter-spacing: 10px;
            font-size: 36px;
          ">
            ${otp}
          </h1>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create this account, please ignore this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: gray;">
            This is an automated email from ChatApp.
          </p>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      `OTP email sent successfully to ${email}`
    );

    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw new Error("Failed to send OTP email");
  }
};