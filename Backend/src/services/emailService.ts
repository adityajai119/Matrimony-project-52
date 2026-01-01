import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    static async sendProgressReport(userEmail: string, userName: string, data: any): Promise<void> {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ SMTP credentials missing. Email not sent.');
            console.log('--- Mock Email Content ---');
            console.log(`To: ${userEmail}`);
            console.log('Subject: Your LimitBreaker Progress Report');
            return;
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #ff6b35, #f2c94c); padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0;">LimitBreaker 💪</h1>
                    <p style="margin: 5px 0 0;">Your Personal Progress Report</p>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #ff6b35;">Hi ${userName},</h2>
                    <p>Here is your latest fitness snapshot. Keep up the great work!</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; border-bottom: 2px solid #ddd; padding-bottom: 5px;">🔥 Current Stats</h3>
                        <p><strong>Power Level:</strong> ${data.powerLevel}</p>
                        <p><strong>Title:</strong> ${data.title}</p>
                        <p><strong>Streak:</strong> ${data.streak} Days</p>
                        <p><strong>BMI:</strong> ${data.bmi} (${data.bmiStatus})</p>
                    </div>

                    ${data.todaysWorkout ? `
                    <div style="background: #eef2ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #4361ee; border-bottom: 2px solid #a5b4fc; padding-bottom: 5px;">🏋️ Today's Workout</h3>
                        <ul style="padding-left: 20px;">
                            ${data.todaysWorkout.map((ex: any) => `<li><strong>${ex.name}</strong>: ${ex.sets}x${ex.reps}</li>`).join('')}
                        </ul>
                    </div>
                    ` : '<p>No workout planned for today.</p>'}

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:4200" style="background: #ff6b35; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                </div>
                
                <div style="background: #333; color: #888; padding: 10px; text-align: center; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} LimitBreaker. All rights reserved.
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"LimitBreaker" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `🚀 Progress Update: ${data.streak} Day Streak!`,
            html: htmlContent
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${userEmail}`);
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            throw new Error('Email sending failed');
        }
    }

    // Send OTP for email verification
    static async sendOTP(userEmail: string, otp: string): Promise<void> {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ SMTP credentials missing. Email not sent.');
            console.log('--- Mock OTP Email ---');
            console.log(`To: ${userEmail}`);
            console.log(`OTP: ${otp}`);
            return;
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #ff6b35, #f2c94c); padding: 25px; text-align: center; color: white;">
                    <h1 style="margin: 0;">🔐 Email Verification</h1>
                    <p style="margin: 5px 0 0;">LimitBreaker</p>
                </div>
                
                <div style="padding: 30px; text-align: center;">
                    <p style="font-size: 16px;">Your One-Time Password (OTP) is:</p>
                    
                    <div style="background: linear-gradient(135deg, #ff6b35, #f2c94c); color: white; font-size: 36px; font-weight: bold; letter-spacing: 10px; padding: 20px 40px; border-radius: 10px; display: inline-block; margin: 20px 0;">
                        ${otp}
                    </div>
                    
                    <p style="color: #888; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
                    <p style="color: #888; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
                
                <div style="background: #333; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Smart Fitness AI. All rights reserved.
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"LimitBreaker" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `🔐 Your Verification Code: ${otp}`,
            html: htmlContent
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ OTP sent to ${userEmail}`);
        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            throw new Error('OTP email sending failed');
        }
    }
}
