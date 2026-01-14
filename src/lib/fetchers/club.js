import { fetchData } from "../api";
import { withClientFilter } from "../middleware/clientFilter";

export function getMeetings(date, meetingType) {
  let query = "?"
  if (date) query += "date=" + date;
  if (meetingType) query += "&meetingType" + meetingType;
  return fetchData(`allMeeting${query}`);
}

export function getMeeting(id) {
  const meetingLink = `${process.env.NEXT_PUBLIC_CLIENT_ENDPOINT}/meet/${id}`
  return fetchData(`getMeetingDetails?meetingLink=${meetingLink}`);
}

export function getFreeTrialUsers() {
  return fetchData("free-trial-users");
}

export function getClubClientVolumePoints() {
  return fetchData("clubClientsWithVP");
}

export function getClubClientSubscriptions(page, limit) {
  return fetchData(`getAllSubscription?page=${page}&limit=${limit}`);
}

export function getMeetingZoomEvents(_id) {
  return fetchData(`zoom/${_id}/event`);
}

export function getRequestVolumePoints() {
  return fetchData("getReqVpByClients");
}

export function getRequestSubscriptions() {
  return fetchData("getReqSubscriptionByClients");
}

export function getClientSubscriptions(id) {
  return fetchData(`getSubscription/${id}`);
}

export function getClientVolumePoints(id) {
  return fetchData(`getClientVP?clientId=${id}`);
}

export function getClientAttendance(id) {
  return fetchData(`getClientAttendance/${id}`);
}

export const getMeetingPersonList = withClientFilter((person, query) => {
  return fetchData(`app/meeting/person-list?person=${person}&query=${query}`);
});

export const getMeetingClientList = withClientFilter(() => {
  return fetchData("app/meeting/client-list");
});