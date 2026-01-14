import {
  endOfMonth, format, getDate, isAfter, isBefore,
  startOfDay, startOfMonth, subMinutes,
  addDays, addMinutes, differenceInCalendarDays, endOfDay,
  getDaysInMonth,
  startOfYear,
  endOfYear,
  getMonth,
  subDays,
} from "date-fns";
import { _throwError } from "./formatter";
import { MONTHS } from "@/config/data/date";

export function manualAttendance(data, range) {
  const startOfTheDay = startOfDay(range?.from);
  const endOfTheDay = endOfDay(range?.to);

  return data.flatMap(client => {
    const filteredAttendance = (client?.attendance || []).filter(att =>
      isAfter(att.date, startOfTheDay) &&
      isBefore(att.date, endOfTheDay)
    )
    return filteredAttendance.map(att => ({
      clientId: client?.client?._id,
      name: client?.client?.name,
      profilePhoto: client?.client?.profilePhoto,
      ...att
    }))
  })
}

export function manualAttendanceWithRange(data, range) {
  const start = startOfDay(range?.from || new Date());
  const end = endOfDay(range?.to || new Date());

  const totalDays = Math.abs(differenceInCalendarDays(range.from, range.to)) + 1;

  return data
    .map(client => {
      const attendanceMap = {};
      (client?.attendance || []).forEach(att => {
        if (
          isBefore(subMinutes(new Date(att.date), 1), end) &&
          isAfter(addMinutes(new Date(att.date), 1), start)
        ) {
          const dayIndex = getDate(new Date(att.date));
          attendanceMap[dayIndex] = att;
        }
      });

      const dailyAttendance = Array.from({ length: totalDays }, (_, i) => {
        const currentDate = addDays(start, i);
        const entry = attendanceMap[getDate(currentDate)];
        return Boolean(entry)
          ? {
            date: entry.date,
            status: entry.status,
            markedAt: entry.markedAt,
            name: client?.client?.name,
            profilePhoto: client?.client?.profilePhoto,
            clientId: client?.client?._id,
            membership: client?.membership // Preserve membership data
          }
          : {
            date: currentDate,
            status: 123,
            name: client?.client?.name,
            profilePhoto: client?.client?.profilePhoto,
            clientId: client?.client?._id,
            membership: client?.membership // Preserve membership data
          };
      });

      return {
        clientName: client?.client?.name,
        clientProfile: client?.client?.profilePhoto,
        dailyAttendance
      };
    })
    .flatMap(client => client?.dailyAttendance);
}

/**
 * Enhanced version of manualAttendanceWithRange that supports multiple attendance records per day.
 * 
 * Key differences from manualAttendanceWithRange:
 * - Groups attendance by date to handle multiple records per day
 * - Creates separate records for each attendance entry on the same day
 * - Includes servingNumber to track multiple servings
 * - Maintains all attendance records instead of overwriting with the latest one
 * 
 * @param {Array} data - Array of client data with attendance records
 * @param {Object} range - Date range object with from and to properties
 * @returns {Array} Array of attendance records with support for multiple records per day
 */
export function manualAttendanceWithRangeMultiple(data, range) {
  const start = startOfDay(range?.from || new Date());
  const end = endOfDay(range?.to || new Date());

  const totalDays = Math.abs(differenceInCalendarDays(range.from, range.to)) + 1;

  return data
    .flatMap(client => {
      // Group attendance by date to handle multiple records per day
      const attendanceByDate = new Map();

      (client?.attendance || []).forEach(att => {
        if (
          isBefore(subMinutes(new Date(att.date), 1), end) &&
          isAfter(addMinutes(new Date(att.date), 1), start)
        ) {
          const dateKey = format(new Date(att.date), "yyyy-MM-dd");

          if (!attendanceByDate.has(dateKey)) {
            attendanceByDate.set(dateKey, []);
          }
          attendanceByDate.get(dateKey).push(att);
        }
      });

      // Generate records for each day in the range
      const dailyRecords = [];

      for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(start, i);
        const dateKey = format(currentDate, "yyyy-MM-dd");
        const dayAttendances = attendanceByDate.get(dateKey) || [];

        if (dayAttendances.length > 0) {
          // Create a record for each attendance entry on this day
          dayAttendances.forEach((att, index) => {
            dailyRecords.push({
              date: att.date,
              status: att.status,
              markedAt: att.markedAt,
              servingNumber: att.servingNumber || index + 1,
              name: client?.client?.name,
              profilePhoto: client?.client?.profilePhoto,
              clientId: client?.client?._id
            });
          });
        } else {
          // Create an unmarked record for this day
          dailyRecords.push({
            date: currentDate,
            status: "unmarked",
            name: client?.client?.name,
            profilePhoto: client?.client?.profilePhoto,
            clientId: client?.client?._id
          });
        }
      }

      return dailyRecords;
    });
}

export function shakeRequests(data) {
  return data
    .flatMap(client => {
      return (client?.attendance || []).map(attendance => ({
        ...attendance,
        clientId: client?.client?._id,
        name: client?.client?.name,
      }))
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function clientWiseHistoryClientOptions(data) {
  return data.map(item => ({
    clientName: item?.client?.name,
    clientId: item?.client?._id,
    profilePhoto: item?.client?.profilePhoto
  }))
}

export function clientWiseHistory(data, range) {
  if (!range?.from || !range?.to) return [];
  const start = addDays(new Date(range.from), 1);
  const end = new Date(range.to);

  const totalDays =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return data.map(record => {
    const attendanceByDate = new Map();
    record.attendance.forEach(a => {
      const d = new Date(a.date);
      const key = d.toISOString().split("T")[0];

      if (!attendanceByDate.has(key)) {
        attendanceByDate.set(key, []);
      }
      attendanceByDate.get(key).push(a);
    });

    const attendanceInRange = Array.from({ length: totalDays }, (_, i) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      const key = currentDate.toISOString().split("T")[0];
      const dayAttendances = attendanceByDate.get(key) || [];


      if (dayAttendances.length === 0) {
        return {
          date: currentDate.getDate(),
          month: currentDate.getMonth(),
          status: undefined,
          presentCount: 0,
          absentCount: 0,
          unmarkedCount: 0,
          totalServings: 0,
          markedAt: undefined,
        };
      }

      // Calculate serving counts for the day
      const presentCount = dayAttendances.filter(a => a.status === "present").length;
      const absentCount = dayAttendances.filter(a => a.status === "absent").length;
      const unmarkedCount = dayAttendances.filter(a => a.status === "unmarked").length;

      // Determine the primary status for the day
      let primaryStatus = undefined;
      if (presentCount > 0) {
        primaryStatus = "present";
      } else if (absentCount > 0) {
        primaryStatus = "absent";
      } else if (unmarkedCount > 0) {
        primaryStatus = "unmarked";
      }

      return {
        date: currentDate.getDate(),
        month: currentDate.getMonth(),
        status: primaryStatus,
        presentCount,
        absentCount,
        unmarkedCount,
        totalServings: presentCount + absentCount + unmarkedCount,
        markedAt: dayAttendances.length > 0 ? dayAttendances[0].markedAt : undefined,
      };
    });

    return {
      clientName: record?.client?.name ?? "Unknown",
      clientProfile: record?.client?.profilePhoto ?? null,
      attendanceInRange,
    };
  });
}



export function clubHistory(clients, { from, to } = {}) {
  const daysPending = Math.abs(differenceInCalendarDays(from, to)) + 1;
  return clients.map((record, index) => {
    const { client, attendance, membership } = record;

    const filteredAttendance = attendance;

    const presentRecords = filteredAttendance.filter(a => a.status === "present");

    const presentDays = new Set(
      presentRecords.map(a => {
        try {
          return startOfDay(new Date(a.date)).getTime();
        } catch (error) {
          return null;
        }
      })
        .filter(Boolean)
    ).size;

    const dayStatusMap = new Map();
    filteredAttendance.forEach(record => {
      try {
        const dayKey = startOfDay(new Date(record.date)).getTime();
        const currentRecord = dayStatusMap.get(dayKey);

        if (!currentRecord) {
          dayStatusMap.set(dayKey, record);
        } else {
          const currentTime = new Date(currentRecord.markedAt || currentRecord.date).getTime();
          const recordTime = new Date(record.markedAt || record.date).getTime();

          if (recordTime > currentTime) {
            dayStatusMap.set(dayKey, record);
          }
        }
      } catch (error) { }
    });

    const finalStatusMap = new Map();
    dayStatusMap.forEach((record, dayKey) => {
      finalStatusMap.set(dayKey, record.status);
    });

    const correctedPresentDays = Array.from(finalStatusMap.values()).filter(status => status === "present").length;
    const correctedAbsentDays = Array.from(finalStatusMap.values()).filter(status => status === "absent").length;

    const totalConsidered = Math.abs(differenceInCalendarDays(from, to)) + 1;
    const completionPercentage = parseInt(((membership?.pendingServings ?? 0) / daysPending) * 100);
    const showupPercentage =
      totalConsidered > 0
        ? ((presentDays / totalConsidered) * 100).toFixed(1)
        : 0;

    let showupLabel = "N/A";

    if (showupPercentage >= 75) {
      showupLabel = "High";
    } else if (showupPercentage >= 50) {
      showupLabel = "Moderate";
    } else if (showupPercentage > 25) {
      showupLabel = "Low";
    } else {
      showupLabel = "Very Low"
    }

    return {
      clientId: index + 1,
      clientName: client?.name,
      clientProfile: client?.profilePhoto,
      clientStatus: client?.isPhysicalClubActive,
      presentDays: correctedPresentDays,
      servingsTaken: correctedPresentDays,
      absentDays: correctedAbsentDays,
      showupPercentage: Number(showupPercentage),
      showupLabel,
      pendingServings: membership?.pendingServings || 0,
      membershipType: membership?.membershipType || "Monthly",
      endDate: membership?.endDate || new Date(),
      completionPercentage
    };
  });
}

export function generateAttendanceRows(data, range) {
  const month = new Date(range.year, range.month, 15)
  const startOfRange = startOfMonth(month)
  const endOfRange = endOfMonth(month)
  return data
    .map((record, index) => {
      const todayAttendance = record.attendance.filter(a =>
        isAfter(addMinutes(new Date(a.date), 4), startOfRange) &&
        isBefore(new Date(a.date), endOfRange)
      )
      return todayAttendance.map(item => ({
        clientId: index + 1,
        clientName: record?.client?.name,
        date: format(item.date, "dd MMM, yyyy"),
        status: item.status,
        profilePhoto: record?.client?.profilePhoto
      }))
    })
    .flatMap(item => item)
}

export function statusClases(status) {
  switch (status) {
    case "absent":
      return "bg-red-100 text-red-600"
    case "present":
      return "bg-green-100 text-green-700"
    default:
      return "text-white bg-[#909090]";
  }
}

export function physicalClubReportsMonthly(data, range) {
  const start = subMinutes(startOfDay(range.from), 1)
  const end = endOfDay(range.to)

  const daysList = Array.from(
    { length: getDaysInMonth(new Date()) },
    (_, i) => i + 1
  )
    .map((item) => (
      { date: item, presentee: 0 }
    ))

  const attendanceMap = data
    .flatMap(client => client.attendance)
    .filter(({ date, status }) =>
      isAfter(new Date(date), start) &&
      isBefore(new Date(date), end) &&
      status === "present"
    )
    .reduce((acc, record) => ({
      ...acc,
      [getDate(new Date(record.date))]: (acc[getDate(new Date(record.date))] || 0) + 1
    }), {})

  return {
    XAxisDataKey: "date",
    YAxisDataKey: "presentee",
    data: daysList
      .map(date => ({
        ...date,
        presentee: attendanceMap[date.date] || 0
      })),
  }
}

export function physicalClubReportsYearly(data, range) {
  const start = subMinutes(startOfYear(range.from), 1)
  const end = endOfYear(range.to)

  const monthsList = MONTHS.map(name => ({
    month: name,
    presentee: 0,
  }))

  const attendanceMap = data
    .flatMap(client => client.attendance)
    .filter(({ date, status }) =>
      isAfter(new Date(date), start) &&
      isBefore(new Date(date), end) &&
      status === "present"
    )
    .reduce((acc, record) => {
      const monthIndex = getMonth(new Date(record.date)) // 0–11
      const monthName = MONTHS[monthIndex]
      acc[monthName] = (acc[monthName] || 0) + 1
      return acc
    }, {})

  return {
    XAxisDataKey: "month",
    YAxisDataKey: "presentee",
    data: monthsList.map(item => ({
      ...item,
      presentee: attendanceMap[item.month] || 0,
    })),
  }
}


export function dateWiseAttendanceSplit(data) {
  const badgeData = {}
  const clientSet = new Set();
  data.forEach(item => {
    const dateKey = format(item.date, "yyyy-MM-dd")
    if (
      item.status !== "present" &&
      clientSet.has(`${item.clientId}-${dateKey}`)
    ) {
      return;
    }
    clientSet.add(`${item.clientId}-${dateKey}`);
    if (!badgeData[dateKey]) {
      badgeData[dateKey] = { present: 0, absent: 0, requested: 0 }
    }

    switch (item.status) {
      case "present":
        badgeData[dateKey].present += 1
        break
      case "absent":
        badgeData[dateKey].absent += 1
        break
      case "requested":
        badgeData[dateKey].requested += 1
        break
      default:
        break
    }
  })
  const formattedData = {}
  Object.keys(badgeData).forEach(dateKey => {
    const badges = []
    if (badgeData[dateKey].present > 0) {
      badges.push({ value: String(badgeData[dateKey].present), color: "bg-green-500" })
    }
    formattedData[dateKey] = badges
  })

  return formattedData
}

export function getPresentAbsent(data) {
  let present = 0
  let absent = 0
  let requested = 0

  data.forEach(record => {
    record.attendance.forEach(att => {
      if (att.status === "present") present++
      else if (att.status === "absent") absent++
      else if (att.status === "requested") requested++
    })
  })

  return { present, absent, requested }
}

function manualAttendanceExcelData(data, range) {
  const attendance = manualAttendance(data, range)
  return attendance.map((item, index) => ({
    "Sr No": index + 1,
    "Name": item.name,
    "Date": format(item.date, "dd-MM-yyyy"),
    "Status": item.status
  }))
}

function shakeRequestExcelData(data, range) {
  const requests = shakeRequests(data)
    .filter(item =>
      isBefore(item.date, endOfDay(range.to)) &&
      isAfter(item.date, startOfDay(range.from))
    )
  return requests.map((record, index) => ({
    "Sr No.": index + 1,
    "Client Name": record.name,
    "Request Date": format(record.markedAt, "dd-MM-yyyy"),
    "Time": format(record.markedAt, "HH:MM a"),
    "Status": record.status
  }))
}

function clientWiseExcelData(data, range) {
  const records = clientWiseHistory(data, range);
  return records.map((record, index) => {
    const item = {
      "Sr No.": index + 1,
      "Name": record.clientName,
    };
    for (const info of record.attendanceInRange) {
      item[String(" " + info["date"])] = info["status"] || "N/A"
    }
    return item
  })
}

function clubHistoryExcelData(data, range) {
  const records = clubHistory(data, range);
  return records.map((record, index) => ({
    "Sr No.": index,
    "Name": record.clientName,
    "Client Status": record.clientStatus ? "Active" : "In Active",
    "Present Days": record.presentDays,
    "Absent Days": record.absentDays,
    "Showup Percentage": `${record.showupPercentage || 0}%`
  }))
}

function generateAttendanceRowsExcelData(data, range) {
  const records = generateAttendanceRows(data, range);
  return records.map((record, index) => ({
    "Sr No.": index + 1,
    "Name": record.clientName,
    "Date": record.date,
    "Status": record.status || "requested"
  }))
}

export function physicalAttendanceExcelDownload(
  tab,
  data,
  range
) {
  switch (tab) {
    case "manual-attendance":
      return manualAttendanceExcelData(data, range)
    case "shake-requests":
      return shakeRequestExcelData(data, range)
    case "clientwise-history":
      return clientWiseExcelData(data, range)
    case "club-history":
      return clubHistoryExcelData(data, range)
    case "reports":
      return generateAttendanceRowsExcelData(data, range)
    default:
      break;
  }
}

export function manualAttendanceGroupClients(clients) {
  let result = [] // {id: Number, clientId: mongo _id, history: []}
  const clientSet = new Set();

  for (const client of clients) {
    if (clientSet.has(client.clientId)) {
      result = result.map(item => item.clientId === client.clientId
        ? ({
          ...item,
          history: [
            ...item.history,
            {
              servingNumber: client.servingNumber,
              markedAt: client.markedAt,
              date: client.date,
              status: client.status
            }
          ]
        })
        : item
      )
    }

    else {
      clientSet.add(client.clientId)
      result = [
        ...result,
        {
          name: client.name,
          clientId: client.clientId,
          profilePhoto: client.profilePhoto,
          history: [
            ...(client.status !==
              "unmarked" ?
              [{
                servingNumber: client.servingNumber,
                markedAt: client.markedAt,
                date: client.date,
                status: client.status
              }]
              : [])
          ]
        }
      ]
    }
  }

  return result
}