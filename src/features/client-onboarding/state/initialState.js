export const buildClientOnboardingIS = function () {
  return {
    stage: "login", // login, mobilenumber, goal, gender-dob, exercise-activity, conditions-allergies, region-selection, preferences
    firstName: "",
    lastName: "",
    // email: "",
    mobileNumber: "",
    goal: "",
    gender: "",
    dob: "",
    weight: "",
    weightUnit: "",
    height: "",
    heightUnit: "",
    dailyActivity: "",
    medicalConditions: [],
    allergies: [],
    dietPreferences: "",
    countryPreference: "",
    regionPreference: "",
    clientsList: [],
    coachId: "",
  }
}