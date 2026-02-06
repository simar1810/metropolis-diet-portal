const stagesMap = {
  "login": "login",
  "client-selection": "login",
  "mobilenumber": "client-selection",
  "preferences": "region-selection",
  "region-selection": "conditions-allergies",
  "conditions-allergies": "exercise-activity",
  "exercise-activity": "gender-dob",
  "gender-dob": "goal",
  "goal": "client-selection",
}

export const clientOnboardingReducer = function (state, action) {
  switch (action.type) {
    case "UPDATE_FIELDS":
      return {
        ...state,
        ...action.payload
      }
    case "PREVIOUS_STEP":
      return {
        ...state,
        stage: stagesMap[state.stage]
      }
    default:
      return state;
  }
}

export const updateDetails = function (fields) {
  return {
    type: "UPDATE_FIELDS",
    payload: fields
  }
}

export const previousStep = function () {
  return { type: "PREVIOUS_STEP" }
}