import { mutate } from "swr";

export const refreshAttendanceData = (clientId) => {
  mutate("app/physical-club/attendance");
  if (clientId) {
    mutate(`app/physical-club/attendance/${clientId}`);
  }
  
  mutate((key) => {
    if (typeof key === 'string') {
      const shouldRefresh = key.includes('physical-club/attendance');
      return shouldRefresh;
    }
    return false;
  });
};

export const refreshAttendanceDataWithDelay = (clientId, delay = 500) => {
  setTimeout(() => {
    refreshAttendanceData(clientId);
    setTimeout(() => {
      refreshAttendanceData(clientId);
    }, 1000);
  }, delay);
};

export const refreshClubHistoryData = (clientId) => {
  refreshAttendanceData(clientId);
  setTimeout(() => refreshAttendanceData(clientId), 500);
  setTimeout(() => refreshAttendanceData(clientId), 1000);
  setTimeout(() => refreshAttendanceData(clientId), 2000);
  setTimeout(() => refreshAttendanceData(clientId), 3000);
};
