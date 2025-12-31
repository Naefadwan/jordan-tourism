const nodemailer = require('nodemailer');

const sendOTP = async (email, otp, accountType = 'personal') => {
    // Log OTP for development purposes
    console.log(`[EMAIL SERVICE] Sending OTP ${otp} to ${email} (Account Type: ${accountType})`);

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error('[EMAIL SERVICE] Email credentials not configured.');
        console.log(`[EMAIL SERVICE] OTP for ${email}: ${otp}`);
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        const isBusiness = accountType === 'business';
        const subject = isBusiness ? 'Business Verification Code - GOJO' : 'Your Verification Code - GOJO';
        const title = isBusiness ? 'Verify Your Business Email' : 'Verify Your Email Address';
        const welcomeMsg = isBusiness
            ? 'Thank you for choosing GOJO for your business! To start your journey as a tourism partner, please verify your email:'
            : 'Thank you for registering with GOJO! To complete your registration, please use the verification code below:';

        await transporter.sendMail({
            from: `"GOJO" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background: ${isBusiness ? 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">GOJO</h1>
                        <p style="color: #f0f0f0; margin: 10px 0 0 0;">${isBusiness ? 'Business Partner Portal' : 'Discover the Beauty of Jordan'}</p>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">${title}</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            ${welcomeMsg}
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: ${isBusiness ? '#1a2a6c' : '#667eea'}; padding: 20px; display: inline-block; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
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
        return false;
    }
};

const sendCompanyRegistrationEmail = async (email, companyName) => {
    console.log(`[EMAIL SERVICE] Sending registration confirmation to company: ${companyName} (${email})`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.error('[EMAIL SERVICE] Email credentials not configured.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        await transporter.sendMail({
            from: `"GOJO Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to GOJO - Registration Received',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6; color: #333;">
                    <div style="background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d); padding: 40px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">GOJO</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your gateway to Jordan's Wonders</p>
                    </div>
                    
                    <div style="background: white; padding: 40px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                        <h2 style="color: #1a2a6c; margin-top: 0; font-size: 24px; border-bottom: 2px solid #f4f7f6; padding-bottom: 15px;">Welcome, ${companyName}!</h2>
                        
                        <p style="font-size: 16px; line-height: 1.8; color: #555;">
                            Thank you for joining <strong>GOJO</strong>. We've received your business registration request and are excited to have you on board!
                        </p>
                        
                        <div style="background-color: #fff9eb; border-left: 4px solid #fdbb2d; padding: 20px; margin: 25px 0;">
                            <p style="margin: 0; font-weight: 600; color: #856404;">
                                📋 Status: Pending Admin Approval
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
                                Our team is currently reviewing your business details and license. This typically takes 24-48 hours.
                            </p>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.8; color: #555;">
                            Once approved, you'll be able to:
                        </p>
                        <ul style="color: #555; padding-left: 20px; line-height: 2;">
                            <li>Add and manage your travel packages</li>
                            <li>Post accommodations and attractions</li>
                            <li>Connect with travelers from around the world</li>
                        </ul>
                        
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="#" style="background: #1a2a6c; color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block; transition: all 0.3s ease;">Visit Dashboard</a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px 0;">
                        <p style="color: #999; font-size: 13px; text-align: center; font-style: italic;">
                            If you have any questions, feel free to reply to this email.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 12px; letter-spacing: 1px;">
                        <p>© 2025 GOJO Tourism. Amman, Jordan.</p>
                        <div style="margin-top: 10px;">
                            <a href="#" style="color: #7f8c8d; margin: 0 10px; text-decoration: none;">Privacy Policy</a> | 
                            <a href="#" style="color: #7f8c8d; margin: 0 10px; text-decoration: none;">Terms of Service</a>
                        </div>
                    </div>
                </div>
            `,
        });

        console.log(`[GOJO EMAIL SERVICE] ✅ Registration email sent to ${email}`);
    } catch (error) {
        console.error('[GOJO EMAIL SERVICE] ❌ Failed to send registration email:', error.message);
    }
};

module.exports = { sendOTP, sendCompanyRegistrationEmail };
