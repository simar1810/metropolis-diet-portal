import { getDay, isBefore, parse } from "date-fns";

const dayOfWeekToIndexMap = new Map([
  ["Sunday", 0],
  ["Monday", 1],
  ["Tuesday", 2],
  ["Wednesday", 3],
  ["Thursday", 4],
  ["Friday", 5],
  ["Saturday", 6],
]);

export function getRecentNotifications(
  notifications,
  selected,
  { page = 1, limit = 10 } = {}
) {
  const start = (page - 1) * limit
  const end = start + limit

  return notifications
    .filter(notif => filterNotificationByDay(notif, selected))
    .map(notif => {
      let createdTime = new Date(0); // Default to epoch if date is invalid
      if (notif?.createdDate && typeof notif.createdDate === 'string') {
        try {
          const parsed = parse(notif.createdDate, "dd-MM-yyyy HH:mm", new Date());
          // Check if parsed date is valid
          if (!isNaN(parsed.getTime())) {
            createdTime = parsed;
          }
        } catch (error) {
          console.warn("Error parsing createdDate:", notif.createdDate, error);
        }
      }
      return {
        ...notif,
        createdTime
      };
    })
    .sort((dateA, dateB) => isBefore(dateA.createdTime, dateB.createdTime) ? 1 : -1)
    .slice(start, end);
}

export function getReocurrNotification(
  notifications,
  selected,
  { page = 1, limit = 10 } = {}
) {
  const start = (page - 1) * limit
  const end = start + limit

  return notifications
    .filter(notif => filterNotificationByDay(notif, selected))
    .slice(start, end);
}

function filterNotificationByDay(notif, selected) {
  const selectedDayIndexes = selected.length === 0
    ? [0, 1, 2, 3, 4, 5, 6]
    : selected.map(day => dayOfWeekToIndexMap.get(day))

  if (notif.schedule_type === "reocurr") {
    // Safely check reocurrence array
    if (!Array.isArray(notif?.reocurrence) || notif.reocurrence.length === 0) {
      return false;
    }
    return notif.reocurrence.some(day => selectedDayIndexes.includes(day))
  }

  // For schedule type, safely parse the date
  if (!notif?.date || typeof notif.date !== 'string') {
    // If no date is provided, don't filter it out (include it)
    return true;
  }

  try {
    const parsedDate = parse(notif.date, "dd-MM-yyyy", new Date());
    // Check if parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return true; // If date is invalid, include it rather than filter out
    }
    const dayOfWeek = getDay(parsedDate);
    return selectedDayIndexes.includes(dayOfWeek);
  } catch (error) {
    // If parsing fails, include the notification rather than filter it out
    console.warn("Error parsing notification date:", notif.date, error);
    return true;
  }
}