// Generate time slots from 6:00 to 23:00 in 15-minute intervals
export const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  
  // Start at 6:00, end at 23:00
  for (let hour = 6; hour <= 23; hour++) {
    // 4 slots per hour (00, 15, 30, 45)
    for (let minute = 0; minute < 60; minute += 15) {
      // Don't add times after 23:00
      if (hour === 23 && minute > 0) break
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  
  return slots
}

// Format time for display
export const formatTime = (time: string): string => {
  return time
}

// Check if time is within gym hours
export const isValidGymTime = (time: string): boolean => {
  const [hour, minute] = time.split(':').map(Number)
  
  // Between 6:00 and 23:00
  if (hour < 6 || hour > 23) return false
  
  // If hour is 23, only 23:00 is valid
  if (hour === 23 && minute > 0) return false
  
  return true
}

// Get hour from time string
export const getHourFromTime = (time: string): number => {
  return parseInt(time.split(':')[0])
}

// Get minutes from time string
export const getMinuteFromTime = (time: string): number => {
  return parseInt(time.split(':')[1])
}

// Calculate duration between two times in minutes
export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  const startInMinutes = startHour * 60 + startMinute
  const endInMinutes = endHour * 60 + endMinute
  
  return endInMinutes - startInMinutes
}

// Format duration to human readable
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} דקות`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'שעה' : 'שעות'}`
  }
  
  return `${hours} ${hours === 1 ? 'שעה' : 'שעות'} ו-${mins} דקות`
}

