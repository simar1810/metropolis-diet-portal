const stagesMap = {
  "preferences": "region-selection",
  "region-selection": "conditions-allergies",
  "conditions-allergies": "exercise-activity",
  "exercise-activity": "gender-dob",
  "gender-dob": "goal",
  "goal": "mobilenumber",
  "mobilenumber": "mobilenumber",
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

export const createRequestPayload = function (state) {
  return {
    firstName: state.firstName,
    name: `${state.firstName} ${state.lastName}`,
    mobileNumber: state.mobileNumber,
    goal: state.goal,
    sex: state.gender,
    dob: state.dob,
    weight: `${state.weight} ${state.weightUnit}`,
    height: `${state.height} ${state.heightUnit}`,
    activityLevel: state.dailyActivity,
    medicalConditions: state.medicalConditions.join(", "),
    allergies: state.allergies.join(", "),
    dietPreference: state.preferences,
    countryPreference: "India 🇮🇳",
    regionPreference: state.regionPreference,
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