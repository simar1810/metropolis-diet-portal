import {
  format,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  parseISO,
  parse,
  setHours,
  setMinutes,
  setSeconds,
  eachDayOfInterval,
  startOfDay,
  endOfDay
} from 'date-fns';

export function ISO__getTime(timestamp) {
  if (!timestamp) return ""
  return format(parseISO(timestamp), "hh:mm a");
}

export function nameInitials(name) {
  return name
    ?.split(" ")
    ?.slice(0, 2)
    ?.map(word => word?.at(0))
    ?.join("")
    ?.toUpperCase();
}

export function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = differenceInSeconds(now, date);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`;

  const days = differenceInDays(now, date);
  if (days < 2) return 'yesterday';

  return format(date, 'dd-MM');
}

export function format24hr_12hr(timeStr) {
  if (!timeStr) return "";

  // Already in 12-hour format (e.g., "8:00 AM" or "08:00 pm")
  if (/[ap]m$/i.test(timeStr.trim())) {
    try {
      const date = parse(timeStr.trim().toUpperCase(), "hh:mm a", new Date());
      return format(date, "hh:mm a");
    } catch {
      return timeStr;
    }
  }

  // 24-hour format (e.g., "08:00" or "18:30")
  try {
    const date = parse(timeStr.trim(), "HH:mm", new Date());
    return format(date, "hh:mm a");
  } catch {
    return timeStr;
  }
}

export function trimString(str, max = 20) {
  const total = str.split(" ");
  const ellipsis = total.length > max ? "..." : "";
  return total.slice(0, max).join(" ") + ellipsis;
}

export function meetingAttendaceExcel(meetingType, data) {
  if (meetingType === "reocurr") {
    return data.map((attendance, index) => ({
      "Sr No.": index + 1,
      "Client Name": (attendance.details || [])?.map(d => d.name)?.join("\n"),
      "Roll No": (attendance.details || [])?.map(d => d.rollno)?.join("\n"),
      "Joining Date": attendance.commonDate,
      "Joining Time": (attendance.details || [])?.map(d => d.time)?.join("\n"),
    }));
  }

  return data.map((attendance, index) => ({
    "Sr No.": index + 1,
    "Client Name": attendance.name,
    "Roll No": attendance.rollno,
    "Joining Date": attendance?.attendance?.date,
    "Joining Time": attendance?.attendance?.time,
  }))
}

export function buildUrlWithQueryParams(baseUrl, paramsObject = {}) {
  const query = Object.entries(paramsObject)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return baseUrl.includes("?") ? `${baseUrl}&${query}` : `${baseUrl}?${query}`;
}

export function tabChange(value, router, params, pathname) {
  const newParams = new URLSearchParams(params.toString());
  newParams.set("tab", value);
  router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
};

export function getMembershipType(membership) {
  switch (membership.membershipType) {
    case 1:
      return { type: "Monthly", end: format(membership.endDate, "dd/MM/yyyy") }
    case 2:
      return {
        type: "Servings", end: membership.servings
      }
    default:
      return { type: "Unknown", end: "Unknown" };
  }
}

export function _throwError(message = "checking payload") {
  throw new Error(message)
}

export function setDateWithNewTime(date, timeString) {
  const parsedTime = parse(timeString, "hh:mm a", new Date())
  let updatedDate = new Date(date)
  updatedDate = setHours(updatedDate, parsedTime.getHours())
  updatedDate = setMinutes(updatedDate, parsedTime.getMinutes())
  updatedDate = setSeconds(updatedDate, 0)

  return new Date(updatedDate).toISOString()
}

export function buildClickableUrl(urlString) {
  if (!urlString || urlString.trim() === "") {
    return ""
  }
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = "https://" + urlString
  }
  return urlString
}

export function formatMessage(text) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  return text.replace(urlRegex, (url) => {
    const href = url.startsWith("http") ? url : `https://${url}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">${url}</a>`;
  });
}

export function getDaysInMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(year, month, dayNum);
    return {
      date: dayNum,
      day: format(dateObj, "EEE")
    };
  });
}

export function datesInRange(range) {
  if (!range?.from || !range?.to) return [];

  return eachDayOfInterval({
    start: startOfDay(range.from),
    end: endOfDay(range.to)
  }).map(dateObj => ({
    date: dateObj.getDate(),
    month: dateObj.getMonth(),
    year: dateObj.getFullYear(),
    day: format(dateObj, "EEE"),
  }));
}


export function validLink(link) {
  return /^https?:\/\/.*$/.test(link);
}

export function ensureHttps(url = "") {
  if (typeof url !== "string") return "";
  url = url.trim();
  url = url.replace(/^.*?:\/\/.*?:\/\/|^.*?:\/\/|:\/\/.*?:\/\/|:\/\/+|:.*?:\/\/+/gi, "https://");
  url = url.replace(/^(?:https?:\/\/)+/i, "https://");
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}
