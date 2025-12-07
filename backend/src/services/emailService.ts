import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (
  toEmail: string,
  userName: string,
  resetUrl: string
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"BEAST Gym" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'איפוס סיסמה - BEAST Gym',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #0f172a;
            color: #ffffff;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 16px;
            border: 1px solid #334155;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 36px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #06b6d4;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(6, 182, 212, 0.4);
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .link {
            color: #06b6d4;
            word-break: break-all;
            font-size: 14px;
          }
          .footer {
            padding: 20px 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #334155;
          }
          .warning {
            background-color: #fef3c7;
            border-right: 4px solid #f59e0b;
            color: #78350f;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BEAST</div>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
              בית לאימון מבוסס מדע
            </p>
          </div>
          
          <div class="content">
            <div class="greeting">שלום ${userName},</div>
            
            <div class="message">
              קיבלנו בקשה לאיפוס הסיסמה שלך במערכת BEAST Gym.
            </div>
            
            <div class="message">
              לחץ על הכפתור למטה כדי לאפס את הסיסמה שלך:
            </div>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">
                🔑 אפס סיסמה
              </a>
            </div>
            
            <div class="warning">
              ⚠️ <strong>לתשומת ליבך:</strong> הקישור תקף ל-1 שעה בלבד.
            </div>
            
            <div class="message">
              אם אינך יכול ללחוץ על הכפתור, העתק והדבק את הקישור הבא בדפדפן:
            </div>
            
            <div class="link">
              ${resetUrl}
            </div>
            
            <div class="message" style="margin-top: 30px;">
              <strong>לא ביקשת איפוס סיסמה?</strong><br>
              אין צורך לעשות דבר - הסיסמה שלך נשארת מאובטחת ולא שונתה.
            </div>
          </div>
          
          <div class="footer">
            <p>
              מייל זה נשלח אוטומטית ממערכת ניהול האימונים של BEAST Gym<br>
              אין להשיב לכתובת זו
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};
