import { addDays, differenceInYears, format, parse, subYears } from "date-fns";
import { addClientCheckupInitialState } from "../state-data/add-client-checkup";
import { ddMMyyyy } from "../data/regex";

export function addClientCheckupReducer(state, action) {
  switch (action.type) {
    case "SET_CURRENT_STAGE":
      return {
        ...state,
        stage: action.payload
      }
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "CHANGE_HEIGHT_UNIT":
      return {
        ...state,
        heightUnit: action.payload,
        heightCms: action.payload.toLowerCase() === "cms"
          ? (Number(state.heightFeet) * 30.48) + (Number(state.heightInches) * 2.54)
          : state.heightCms,
        heightFeet: action.payload.toLowerCase() === "inches"
          ? Math.floor(Number(state.heightCms) / 30.48)
          : state.heightFeet,
        heightInches: action.payload.toLowerCase() === "inches"
          ? Math.round(((Number(state.heightCms) / 30.48) % 1) * 12)
          : state.heightInches,
      }
    case "CHANGE_WEIGHT_UNIT":
      return {
        ...state,
        weightUnit: action.payload,
        weightInKgs: action.payload.toLowerCase() === "kg"
          ? (Number(state.weightInPounds) * 0.453592).toFixed(2)
          : state.weightInKg,
        weightInPounds: action.payload.toLowerCase() === "pounds"
          ? (Number(state.weightInKgs) / 0.453592).toFixed(2)
          : state.weightInPounds,
      }
    case "UPDATE_MATRICES":
      return {
        ...state,
        ...action.payload
      }
    case "CLIENT_CREATION_DONE":
      return {
        ...addClientCheckupInitialState,
        stage: 4,
        clientId: action.payload
      }
    case "CHANGE_NEXT_FOLLOW_UP_TYPE":
      return {
        ...state,
        nextFollowupType: "8-day",
        nextFollowup: format(addDays(new Date(), 8), 'yyyy-MM-dd')
      }
    case "CLIENT_ONBOARDING_COMPLETED":
      return {
        ...state,
        stage: 5
      }
    default:
      return state;
  }
}

export function setCurrentStage(stage) {
  return {
    type: "SET_CURRENT_STAGE",
    payload: stage
  }
}

export function createdClient(clientId) {
  return {
    type: "CLIENT_CREATION_DONE",
    payload: clientId
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

export function changeHeightUnit(unit) {
  return {
    type: "CHANGE_HEIGHT_UNIT",
    payload: unit
  }
}

export function changeWeightUnit(payload) {
  return {
    type: "CHANGE_WEIGHT_UNIT",
    payload
  }
}

export function changeNextFollowUpType(payload) {
  return { type: "CHANGE_NEXT_FOLLOW_UP_TYPE" }
}

export function updateMatrices(matrices, values) {
  const payload = {};
  for (const matrix of matrices) {
    if (values[matrix.name]) payload[matrix.name] = values[matrix.name];
  }
  return {
    type: "UPDATE_MATRICES",
    payload
  }
}

const fields = {
  stage1: ["name", "gender", "joiningDate", "heightUnit", "weightUnit", "bodyComposition"],
  requestFields: [
    "name", "email", "mobileNumber", "notes", "gender",
    "heightUnit", "weightUnit", "bodyComposition", "file", "bmi",
    "visceral_fat", "activeType", "rm", "muscle",
    "fat", "ideal_weight", "bodyAge", "pendingCustomer", "existingClientID", "sub_fat"
  ],
}

export function stage1Completed(state, stage) {
  if (!state.age && !state.dob) return { success: false, field: "Either select dob or age" };
  for (const field of fields[stage]) {
    if (!state[field]) return { success: false, field };
  }
  if (state.weightUnit?.toLowerCase() === "kg" && !state.weightInKgs) {
    return { success: false, field: "Please mention weight in KGs" };
  } else if (state.weightUnit?.toLowerCase() === "pounds" && !state.weightInPounds) {
    return { success: false, field: "Please mention weight in Pounds" };
  }
  if (state.heightUnit.toLowerCase() === "cms") {
    if (!state["heightCms"]) return { success: false, field: "Height Cms" };
  } else {
    if (!state["heightFeet"] || (!state["heightInches"] && state["heightInches"] !== 0)) return {
      success: false,
      field: "Height Feet, Height Inches"
    };
  }
  return { success: true };
}

export function generateRequestPayload(state, coachId, existingClientID) {
  const formData = new FormData();
  for (const field of fields.requestFields) {
    formData.append(field, state[field]);
  }
  if (state.weightUnit?.toLowerCase() === "kg") {
    formData.append("weight", state["weightInKgs"]);
  } else {
    formData.append("weight", state["weightInPounds"]);
  }
  if (state.heightUnit.toLowerCase() === "cms") {
    formData.append("height", state["heightCms"]);
  } else {
    formData.append("height", `${state["heightFeet"]}.${state["heightInches"]}`);
  }
  if (state.dob) {
    formData.append("dob", format(parse(state.dob, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy'));
  }
  for (const field of ["followUpDate", "joiningDate"]) {
    formData.append(field, format(parse(state[field], 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy'));
  }
  formData.append("coachId", coachId);
  formData.append("existingClientID", existingClientID);
  formData.append("age", state.age)
  return formData;
}

export function init(type, data) {
  if (type !== "add-details") return addClientCheckupInitialState;
  const payload = addClientCheckupInitialState;
  for (const field of ["mobileNumber", "name", "clientId"]) {
    payload[field] = data[field] || "";
  }
  if (ddMMyyyy.test(data.dob)) {
    const bday = parse(data.dob, "dd-MM-yyyy", new Date())
    payload.dob = format(
      bday,
      "yyyy-MM-dd"
    )
    const age = differenceInYears(new Date(), bday)
    payload.age = age > 0 ? age : 0
  }
  payload.pendingCustomer = "true";
  payload.existingClientID = data._id;
  return payload;
}

export function clientOnboardingCompleted() {
  return {
    type: "CLIENT_ONBOARDING_COMPLETED"
  }
}