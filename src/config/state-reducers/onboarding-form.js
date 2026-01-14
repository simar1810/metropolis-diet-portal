import { onboardingFormInitialState } from "../state-data/onboarding-form";

export function onboardingFormReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "CLIENT_CREATED":
      return onboardingFormInitialState

    default:
      break;
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

export function clientCreated() {
  return {
    type: "CLIENT_CREATED"
  }
}