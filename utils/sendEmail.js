const nodemailer = require('nodemailer');

const sendEmail = async (Options) => {
    //1- create transporter ( service that will send email like "gmail")
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user:process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    //2- Define email options ( like from, to, subject, email content)
    const mailOpts = {
        from: `E-shop App <ib.alenany4@gmail.com>`,
        to: Options.email,
        subject: Options.subject,
        text: Options.message,
    };

    //3- send email
    await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;