const state = {
  stage: 1,
  mobileNumber: "",
  otp: "",
  isFirstTime: false,
  loginType: "coach", // "coach" or "user"
  userLogin: {
    userId: "",
    password: ""
  },
  registration: {
    name: "",
    expectedNoOfClients: "",
    city: "",
    coachId: "",
    organisation: "",
    terms: false,
    coachRef: ""
  }
}

export default state;