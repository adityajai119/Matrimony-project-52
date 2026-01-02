import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export class EmailService {
    // Nodemailer transporter for local development
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    } as any);

    // Generic email sender that picks the right method
    private static async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
        if (isProduction) {
            // Use Brevo API in production
            await this.sendViaBrevo(to, subject, htmlContent);
        } else {
            // Use Nodemailer locally
            await this.sendViaNodemailer(to, subject, htmlContent);
        }
    }

    // Brevo (Sendinblue) HTTP API - works on Render without SMTP blocking
    private static async sendViaBrevo(to: string, subject: string, htmlContent: string): Promise<void> {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@limitbreaker.app';

        if (!apiKey) {
            console.warn('⚠️ BREVO_API_KEY not set. Email not sent.');
            console.log(`--- Mock Email (Brevo) ---\nTo: ${to}\nSubject: ${subject}`);
            return;
        }

        console.log(`📧 Sending email via Brevo to ${to}...`);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'LimitBreaker', email: senderEmail },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Brevo API Error:', errorText);
            throw new Error(`Brevo email failed: ${response.status}`);
        }

        console.log(`✅ Email sent via Brevo to ${to}`);
    }

    // Nodemailer for local development
    private static async sendViaNodemailer(to: string, subject: string, htmlContent: string): Promise<void> {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ SMTP credentials missing. Email not sent.');
            console.log(`--- Mock Email (Nodemailer) ---\nTo: ${to}\nSubject: ${subject}`);
            return;
        }

        const mailOptions = {
            from: `"LimitBreaker" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent via Nodemailer to ${to}`);
    }

    // Send Progress Report
    static async sendProgressReport(userEmail: string, userName: string, data: any): Promise<void> {
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
                        <a href="https://limitbreaker.pages.dev" style="background: #ff6b35; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                </div>
                
                <div style="background: #333; color: #888; padding: 10px; text-align: center; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} LimitBreaker. All rights reserved.
                </div>
            </div>
        `;

        try {
            await this.sendEmail(userEmail, `🚀 Progress Update: ${data.streak} Day Streak!`, htmlContent);
        } catch (error) {
            console.error('❌ Failed to send progress report:', error);
            throw new Error('Email sending failed');
        }
    }

    // Send OTP for email verification
    static async sendOTP(userEmail: string, otp: string): Promise<void> {
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
                    &copy; ${new Date().getFullYear()} LimitBreaker. All rights reserved.
                </div>
            </div>
        `;

        try {
            await this.sendEmail(userEmail, `🔐 Your Verification Code: ${otp}`, htmlContent);
        } catch (error) {
            console.error('❌ Failed to send OTP:', error);
            throw new Error('OTP email sending failed');
        }
    }
}
