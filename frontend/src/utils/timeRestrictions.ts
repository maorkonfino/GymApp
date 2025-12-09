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
    return 'סגור לגיל השלישי';
  }
  return null;
};

// TeenBEAST allowed time slots by day of week
const TEEN_BEAST_ALLOWED_TIMES: { [key: number]: { start: string; end: string } } = {
  0: { start: '15:30', end: '18:30' }, // Sunday (ראשון)
  1: { start: '15:30', end: '18:30' }, // Monday (שני)
  2: { start: '15:30', end: '17:30' }, // Tuesday (שלישי)
  3: { start: '15:30', end: '18:30' }, // Wednesday (רביעי)
  4: { start: '15:30', end: '18:30' }, // Thursday (חמישי)
  5: { start: '12:00', end: '14:00' }, // Friday (שישי)
  6: { start: '', end: '' }  // Saturday (שבת) - not allowed
};

// Check if TeenBEAST user can register at this time
const canTeenBeastRegister = (date: Date, startTime: string, endTime: string): { allowed: boolean; message?: string } => {
  const dayOfWeek = date.getDay();
  const allowedTime = TEEN_BEAST_ALLOWED_TIMES[dayOfWeek];
  
  // No registration on Saturday
  if (dayOfWeek === 6 || !allowedTime.start) {
    return {
      allowed: false,
      message: 'משתמשי TeenBEAST לא יכולים להירשם ביום זה'
    };
  }
  
  // Check if times are within allowed range
  if (startTime < allowedTime.start || endTime > allowedTime.end) {
    const dayName = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayOfWeek];
    return {
      allowed: false,
      message: `משתמשי TeenBEAST יכולים להירשם ביום ${dayName} רק בין ${allowedTime.start} ל-${allowedTime.end}`
    };
  }
  
  return { allowed: true };
};

// Check if user can register at this time
export const canRegisterAtTime = (
  date: Date, 
  startTime: string, 
  endTime: string, 
  userRole?: string
): { allowed: boolean; message?: string } => {
  // Check if TeenBEAST user
  if (userRole === 'teenbeast') {
    return canTeenBeastRegister(date, startTime, endTime);
  }
  
  // Check general restricted time slots (Senior citizens)
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

// Check if time slot is during TeenBEAST hours (for showing trainer)
export const isTeenBeastHours = (date: Date, timeSlot: string): boolean => {
  const dayOfWeek = date.getDay();
  const [slotStart] = timeSlot.split('-');
  
  const allowedTime = TEEN_BEAST_ALLOWED_TIMES[dayOfWeek];
  
  // No Teen hours on Saturday or if not defined
  if (dayOfWeek === 6 || !allowedTime.start) {
    return false;
  }
  
  // Check if slot is within Teen hours
  return slotStart >= allowedTime.start && slotStart < allowedTime.end;
};

// Get allowed time range for TeenBEAST users for a specific date
export const getTeenBeastAllowedTimes = (date: Date): { start: string; end: string } | null => {
  const dayOfWeek = date.getDay();
  const allowedTime = TEEN_BEAST_ALLOWED_TIMES[dayOfWeek];
  
  // No registration on Saturday or if not defined
  if (dayOfWeek === 6 || !allowedTime.start) {
    return null;
  }
  
  return allowedTime;
};

// Generate time options in 15-minute intervals for a date, filtered by user role
export const getAvailableTimeOptions = (date: Date, userRole?: string): string[] => {
  const times: string[] = [];
  
  // If TeenBEAST, get allowed times
  if (userRole === 'teenbeast') {
    const allowedTimes = getTeenBeastAllowedTimes(date);
    if (!allowedTimes) {
      return []; // No times available on this day
    }
    
    // Parse start and end times
    const [startHour, startMinute] = allowedTimes.start.split(':').map(Number);
    const [endHour, endMinute] = allowedTimes.end.split(':').map(Number);
    
    // Generate times in 15-minute intervals within allowed range
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        // Skip if before start time
        if (h === startHour && m < startMinute) continue;
        // Skip if after end time
        if (h === endHour && m > endMinute) break;
        if (h > endHour) break;
        
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  } else {
    // For other users, show all times from 06:00 to 23:00
    for (let h = 6; h <= 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
  }
  
  return times;
};

