const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail service
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // App password
    },
});

const sendEmail = async (options) => {
    const message = {
        from: process.env.EMAIL_USER, // Use EMAIL_USER as the sender
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(message);
    console.log(`Email sent successfully to ${options.email}`);
};

module.exports = sendEmail;