export const followUpInitialState = {
  stage: 1,
  healthMatrix: {
    date: "",
    weightUnit: "Kg", // e.g. Kg Pounds
    weightInKgs: "",
    weightInPounds: "",
    heightUnit: "Cm", // e.g. Inches, Cm
    heightCms: "",
    heightFeet: "",
    heightInches: "",
    bmi: "",
    body_composition: "Slim",
    visceral_fat: "",
    createdDate: "",
    rm: "",
    muscle: "",
    fat: "",
    ideal_weight: "",
    bodyAge: "",
    gender: "male",
    followUpType: "8day"
  },
  nextFollowUpDate: ""
}