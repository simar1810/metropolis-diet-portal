import { clubSystemInitialState } from "../state-data/clubsystem";

export function clubSystemReducer(state, action) {
  switch (action.type) {
    case "ALERT_CLUB_SYSTEM_CHANGE":
      return {
        ...state,
        stage: "alert",
        selectedClubSystem: action.payload
      }
    case "CONFIRM_CLUB_SYSTEM_CHANGE":
      return {
        ...state,
        stage: "confirmation"
      }
    case "UPDATE_OTP":
      return {
        ...state,
        otp: action.payload
      }
    case "RESET":
      return clubSystemInitialState
    case "CLUB_SYSTEM_CHANGE":
      return {
        ...state,
        selectedClubSystem: action.payload
      }
    default:
      return state;
  }
}

export function alertClubSystemChange(clubSystem) {
  return {
    type: "ALERT_CLUB_SYSTEM_CHANGE",
    payload: clubSystem
  }
}

export function confirmClubSystemChange() {
  return { type: "CONFIRM_CLUB_SYSTEM_CHANGE" }
}

export function resetClubSystemChange() {
  return { type: "RESET" }
}

export function onChangeOTP(otp) {
  return { type: "UPDATE_OTP", payload: otp }
}

export function changeClubSystem(clubSystem) {
  return { type: "CLUB_SYSTEM_CHANGE", payload: clubSystem }
}