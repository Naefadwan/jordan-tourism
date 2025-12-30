const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    // Log OTP for development purposes
    console.log(`[EMAIL SERVICE] Sending OTP ${otp} to ${email}`);

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error('[EMAIL SERVICE] Email credentials not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env file');
        console.log(`[EMAIL SERVICE] OTP for ${email}: ${otp}`);
        return;
    }

    try {
        // Configure Gmail SMTP transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        // Send email with Jordan Tourism branding
        await transporter.sendMail({
            from: `"GOJO" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code - GOJO',
            text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">GOJO</h1>
                        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Discover the Beauty of Jordan</p>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Thank you for registering with GOJO! To complete your registration, please use the verification code below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; display: inline-block; border-radius: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                <h1 style="color: white; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
                            </div>
                        </div>
                        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                            ⏱️ This code will expire in <strong>10 minutes</strong>
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>© 2025 GOJO. All rights reserved.</p>
                    </div>
                </div>
            `,
        });

        console.log(`[GOJO EMAIL SERVICE] ✅ Email sent successfully to ${email}`);
    } catch (error) {
        console.error('[GOJO EMAIL SERVICE] ❌ Failed to send email:', error.message);
        console.log(`[GOJO EMAIL SERVICE] OTP for ${email}: ${otp} (Fallback - email failed)`);
        throw new Error('Failed to send verification email. Please try again.');
    }
};

module.exports = { sendOTP };
