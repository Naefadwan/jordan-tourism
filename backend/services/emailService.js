const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    // For development, we log to console
    console.log(`[EMAIL SERVICE] Sending OTP ${otp} to ${email}`);

    // Fallback/Placeholder for real SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: `"GOJO Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your Verification Code - GOJO',
                text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
                html: `<div style="font-family: sans-serif; padding: 20px;">
                    <h2>Verify Your Email</h2>
                    <p>Thank you for signing up with GOJO. Use the code below to complete your registration:</p>
                    <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>`,
            });
            console.log(`[EMAIL SERVICE] Email sent successfully to ${email}`);
        } catch (error) {
            console.error('[EMAIL SERVICE] Failed to send email:', error);
        }
    } else {
        console.log('[EMAIL SERVICE] SMTP not configured. Check console for OTP.');
    }
};

module.exports = { sendOTP };
