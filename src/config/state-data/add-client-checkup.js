import { addDays, format } from "date-fns";

export const addClientCheckupInitialState = {
  stage: 1,
  name: "",//done
  email: "",
  mobileNumber: "",
  age: "",
  dob: "", //done
  gender: "male",//done
  coachId: "",
  notes: "",
  weightUnit: "Kg", // e.g. Kg Pounds
  weightInKgs: "",
  weightInPounds: "",
  heightUnit: "Cms", // e.g. Inches, Cm
  heightCms: "",
  heightFeet: "",
  heightInches: "",
  bmi: "",
  visceral_fat: "",
  followUpDate: format(addDays(new Date(), 8), 'yyyy-MM-dd'),
  activeType: "active",
  rm: "",
  joiningDate: format(new Date(), 'yyyy-MM-dd'),
  muscle: "",
  fat: "",
  bodyComposition: "Medium",
  ideal_weight: "",
  bodyAge: "",
  pendingCustomer: "",
  existingClientID: "",
  nextFollowupType: "8-day",
  clientType: "new",// e.g. new, existing
  file: null,
  pendingCustomer: false,
  existingClientID: ""
}