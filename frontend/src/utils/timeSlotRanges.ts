// Generate time slot ranges in 30-minute intervals (8:00-8:30, 8:30-9:00, etc.)
export const generateTimeSlotRanges = (): string[] => {
  const slots: string[] = []
  const startHour = 6
  const endHour = 23
  const interval = 30 // minutes

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const nextMinute = minute + interval
      const nextHour = nextMinute >= 60 ? hour + 1 : hour
      const adjustedNextMinute = nextMinute >= 60 ? nextMinute - 60 : nextMinute

      // Stop if we've reached the end time
      if (hour === endHour && minute >= 30) break
      if (nextHour > endHour) break

      const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const endTime = `${String(nextHour).padStart(2, '0')}:${String(adjustedNextMinute).padStart(2, '0')}`
      
      slots.push(`${startTime}-${endTime}`)
    }
  }

  return slots
}

