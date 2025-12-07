import { Registration } from '../database';

// Twilio configuration
// בפרודקשן תצטרך להגדיר את המשתנים האלה ב-.env
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

let twilioClient: any = null;

// Initialize Twilio client only if credentials are provided
const initTwilio = () => {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Twilio:', error);
      return false;
    }
  }
  return false;
};

// Send SMS via Twilio
export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  if (!twilioClient && !initTwilio()) {
    console.log('⚠️ Twilio not configured, skipping SMS');
    return false;
  }

  try {
    // Format phone number for international format
    const formattedPhone = to.startsWith('+') ? to : `+972${to.replace(/^0/, '')}`;
    
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`✅ SMS sent to ${to}, SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error);
    return false;
  }
};

// Send 24-hour reminder SMS
export const send24HourReminderSMS = async (registration: Registration): Promise<boolean> => {
  const message = `
🏋️ תזכורת מחדר כושר BEAST

שלום ${registration.full_name},

יש לך אימון מחר!
📅 ${registration.date}
⏰ ${registration.start_time} - ${registration.end_time}

תקבל תזכורת נוספת 4 שעות לפני.

בהצלחה! 💪
  `.trim();

  return await sendSMS(registration.phone, message);
};

// Send 4-hour reminder SMS
export const send4HourReminderSMS = async (registration: Registration): Promise<boolean> => {
  const message = `
🔔 חדר כושר BEAST

היי ${registration.full_name}!

האימון שלך בעוד 4 שעות!
⏰ ${registration.start_time} - ${registration.end_time}

נתראה בחדר כושר! 🔥
  `.trim();

  return await sendSMS(registration.phone, message);
};

