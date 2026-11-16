

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
  port: Number(process.env.ETHEREAL_PORT || 587),
  secure: false,

  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

export const sendEmail = async (email) => {
  const info = await transporter.sendMail({
    from: `"ReachInbox Scheduler" <${process.env.ETHEREAL_USER}>`,
    to: email.recipient,
    subject: email.subject,
    text: email.body,
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
};

export const verifySMTP = async () => {
  return await transporter.verify();
};
