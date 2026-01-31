export const buildClientOnboardingIS = function () {
  return {
    stage: "mobilenumber", // mobilenumber, goal, gender-dob, exercise-activity, conditions-allergies

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
  }
}