const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})
const sendEmail = async (options) => {
    const message = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
    await transporter.sendMail(message)
    console.log(`Email sent successfully to ${options.email}`);
}
module.exports = sendEmail;