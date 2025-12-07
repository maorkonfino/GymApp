// Check if time slot is restricted (Sunday and Thursday 9:00-10:00 - Senior citizens)
export const isRestrictedTimeSlot = (date: Date, time: string): boolean => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 4 = Thursday
  
  // Check if Sunday (0) or Thursday (4)
  if (dayOfWeek === 0 || dayOfWeek === 4) {
    // Check if time is between 09:00 and 10:00
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);
    
    if (hour === 9 && minute >= 0 && minute < 60) {
      return true;
    }
  }
  
  return false;
};

// Get restriction message for display
export const getRestrictionMessage = (date: Date, time: string): string | null => {
  if (isRestrictedTimeSlot(date, time)) {
    return '🔒 סגור לגיל השלישי';
  }
  return null;
};

// Check if user can register at this time
export const canRegisterAtTime = (date: Date, startTime: string, endTime: string): { allowed: boolean; message?: string } => {
  // Check start time
  if (isRestrictedTimeSlot(date, startTime)) {
    return {
      allowed: false,
      message: 'לא ניתן להירשם לשעות 09:00-10:00 בימים א\' וה\' (סגור לגיל השלישי)'
    };
  }
  
  // Check if training overlaps with restricted time
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  const dayOfWeek = date.getDay();
  
  if ((dayOfWeek === 0 || dayOfWeek === 4) && startHour < 9 && endHour > 9) {
    return {
      allowed: false,
      message: 'האימון חוצה את השעות 09:00-10:00 (סגור לגיל השלישי)'
    };
  }
  
  return { allowed: true };
};

// Check if date/time has passed
export const hasTimePassed = (date: string, time: string): boolean => {
  const now = new Date();
  const trainingDateTime = new Date(`${date}T${time}`);
  return trainingDateTime < now;
};

