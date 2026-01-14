import { format, parse } from "date-fns";
import { reminderInitialState } from "../state-data/reminder";
import { _throwError } from "@/lib/formatter";

export function reminderReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.field]: action.payload.value
      }

    case "UPDATE_CLIENT_SEARCH_QUERY":
      return {
        ...state,
        other: action.payload
      }

    case "UPDATE_VIEW":
      return {
        ...state,
        view: action.payload ? action.payload : state.attendeeType === "wz_client" ? 2 : 1
      }

    case "SET_ATTENDEE_TYPE":
      return {
        ...state,
        attendeeType: action.payload
      }

    default:
      return state;
  }
}

export function init(data, type) {
  if (type === "UPDATE") {
    const payload = {
      topic: data.topic,
      agenda: data.agenda,
      date: data.date && /^\d{2}-\d{2}-\d{4}$/.test(data.date)
        ? format(parse(data.date, "dd-MM-yyyy", new Date()), "yyyy-MM-dd")
        : (data.date || ""),
      time: data.time,
      attendeeType: "none",
      view: 1
    }
    return payload;
  }
  return reminderInitialState;
}

export function changeFieldValue(field, value) {
  return {
    type: "UPDATE_FIELD_VALUE",
    payload: {
      field,
      value
    }
  }
}

export function changeClientQuery(value) {
  return { type: "UPDATE_CLIENT_SEARCH_QUERY", payload: value }
}

export function changeView(type) {
  return { type: "UPDATE_VIEW", payload: type }
}

export function setAttendeeType(type) {
  return { type: "SET_ATTENDEE_TYPE", payload: type }
}

export function generateReminderPayload(state) {
  const payload = {}
  for (const field in state) {
    payload[field] = state[field];
  }
  if (!payload.date) _throwError("Date is required");
  if (payload.attendeeType === "wz_client") {
    delete payload.other;
  } else {
    delete payload.client;
  }
  if (payload.date) {
    payload.date = format(parse(payload.date, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
  }
  delete payload.attendeeType;
  return payload;
}