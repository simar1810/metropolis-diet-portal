export const clubSystemInitialState = {
  stage: "confirmation", // alert, confirmation
  selectedClubSystem: null,
  otp: ""
}

export const clubSystemData = [
  {
    id: 0,
    title: "Free",
    message: "All clients can join the meeting."
  },
  {
    id: 1,
    title: "Subscription",
    message: ""
  },
  {
    id: 2,
    title: "Volume Points",
    message: "Only Clients with volume points greater than 0 can join the meeting."
  }
]