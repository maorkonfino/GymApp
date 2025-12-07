import nodemailer from 'nodemailer';
import { Registration } from '../database';

// Create email transporter
// בפרודקשן תצטרך להגדיר את המשתנים האלה ב-.env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-password'
  }
});

// Format date and time in Hebrew
const formatDateTime = (date: string, time: string): string => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toLocaleString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Send 24-hour reminder
export const send24HourReminder = async (registration: Registration): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"חדר כושר BEAST" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: '⏰ תזכורת: האימון שלך מחר!',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏋️ חדר כושר BEAST</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0ea5e9; margin-top: 0;">שלום ${registration.full_name}! 👋</h2>
            
            <p style="font-size: 18px; color: #333; line-height: 1.6;">
              זוהי תזכורת ידידותית שיש לך <strong>אימון מחר</strong>!
            </p>
            
            <div style="background: #f0f9ff; border-right: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #0284c7;">📅 פרטי האימון:</h3>
              <p style="margin: 10px 0; font-size: 16px;">
                <strong>תאריך:</strong> ${formatDateTime(registration.date, registration.start_time)}
              </p>
              <p style="margin: 10px 0; font-size: 16px;">
                <strong>שעות:</strong> ${registration.start_time} - ${registration.end_time}
              </p>
            </div>
            
            <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #92400e;">
                💡 <strong>טיפ:</strong> הקפד להגיע 5 דקות לפני כדי להתחמם!
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              תקבל תזכורת נוספת 4 שעות לפני האימון.
            </p>
            
            <p style="color: #666; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              בהצלחה באימון! 💪<br>
              צוות BEAST
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ 24h reminder email sent to ${registration.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send 24h reminder email to ${registration.email}:`, error);
    return false;
  }
};

// Send 4-hour reminder
export const send4HourReminder = async (registration: Registration): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"חדר כושר BEAST" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: '🔔 תזכורת: האימון שלך בעוד 4 שעות!',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏋️ חדר כושר BEAST</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10b981; margin-top: 0;">היי ${registration.full_name}! 🔥</h2>
            
            <p style="font-size: 20px; color: #333; line-height: 1.6; font-weight: bold;">
              האימון שלך מתקרב - בעוד 4 שעות!
            </p>
            
            <div style="background: #ecfdf5; border-right: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #059669;">⏰ זמן האימון:</h3>
              <p style="margin: 10px 0; font-size: 18px;">
                <strong>${registration.start_time} - ${registration.end_time}</strong>
              </p>
              <p style="margin: 10px 0; font-size: 16px; color: #666;">
                ${formatDateTime(registration.date, registration.start_time)}
              </p>
            </div>
            
            <div style="background: #dbeafe; border-right: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #1e40af;">
                ✅ <strong>רשימת בדיקה:</strong><br>
                • בקבוק מים מלא 💧<br>
                • ביגוד ונעלי אימון נוחים 👟<br>
                • מגבת 🧖<br>
                • מוטיבציה גבוהה! 💪
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              מחכים לראות אותך!<br>
              צוות BEAST
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ 4h reminder email sent to ${registration.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send 4h reminder email to ${registration.email}:`, error);
    return false;
  }
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
};

