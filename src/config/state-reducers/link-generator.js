import FormControl from "@/components/FormControl";
import { MeetingBanner, MeetingDescription, MeetingRepeat, MeetingType, SelectOneToOneClient } from "@/components/modals/club/LinkGenerator";
import { linkGeneratorFields } from "../data/ui";
import { formatISO, parse } from "date-fns";
import { linkGeneratorInitialState } from "../state-data/link-generator";
import SelectControl from "@/components/Select";
import SelectMultiple from "@/components/SelectMultiple";
import { useAppSelector } from "@/providers/global/hooks";
import { _throwError } from "@/lib/formatter";

export function linkGeneratorReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }

    case "SET_CURRENT_VIEW":
      return {
        ...state,
        view: action.payload
      }

    case "SET_WELLNESSZ_LINK":
      return {
        ...state,
        wellnessZLink: action.payload,
        view: 5
      }
    case "RESET_STATE":
      return {
        ...linkGeneratorInitialState,
        view: 2
      }

    default:
      return state;
  }
}

export function changeFieldvalue(name, value) {
  return {
    type: "CHANGE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}

export function setCurrentView(payload) {
  return {
    type: "SET_CURRENT_VIEW",
    payload
  }
}

export function setWellnessZLink(link) {
  return {
    type: "SET_WELLNESSZ_LINK",
    payload: link
  }
}

export function resetCurrentState() {
  return { type: "RESET_STATE" }
}

export const meetingTypeFieldsMap = {
  quick: [1, 2, 6, 7, 9, 10, 12, 13],
  scheduled: [1, 2, 3, 4, 6, 7, 9, 10, 12, 13],
  reocurr: [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13],
  event: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13],
  one_to_one: [1, 2, 3, 4, 6, 7, 9, 11, 12],
}

export function selectFields(meetingType) {
  const fields = meetingTypeFieldsMap[meetingType];
  return linkGeneratorFields.filter(field => fields.includes(field.id));
}

export function init(withZoom) {
  if (!withZoom) return {
    ...linkGeneratorInitialState,
    view: 2
  }
  return linkGeneratorInitialState
}

export function generateRequestPayload(state) {
  if (state.meetingType === "one_to_one" && !state.one_to_one_client_id) {
    _throwError("Please select a client");
  }
  const formControls = selectFields(state.meetingType)

  const payload = new FormData;
  for (const field of formControls) {
    payload.append(field.name, state[field.name]);
  }
  if (state.meetingType === "reocurr") {
    payload.delete("reOcurred")
    payload.append("reOcurred", JSON.stringify(state["reOcurred"]));
  }
  if (state.date && state.time) {
    const scheduleDate = formatISO(parse(`${state.date} ${state.time}`, 'yyyy-MM-dd hh:mm a', new Date()));
    payload.append("scheduleDate", scheduleDate);
  } else {
    payload.append("scheduleDate", new Date().toISOString());
  }
  payload.delete("allowed_client_type");
  for (const type of state.allowed_client_type) {
    payload.append("allowed_client_type", type);
  }
  payload.delete("allowed_client_rollnos");
  for (const type of state.allowed_client_rollnos) {
    payload.append("allowed_client_rollnos", type);
  }
  return payload;
}
