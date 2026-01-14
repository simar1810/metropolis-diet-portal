export default function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_MOBILE_NUMBER":
      return { ...state, mobileNumber: action.payload }
    case "UPDATE_CURRENT_STATE":
      const newState = {
        ...state,
        stage: action.payload.stage,
        isFirstTime: action.payload.isFirstTime
      }
      if (action.payload.stage === 2) {
        newState.refreshToken = action.payload.user.refreshToken;
        newState.user = action.payload.user;
      }
      return newState;
    case "UPDATE_OTP":
      return { ...state, otp: action.payload }
    case "UPDATE_LOGIN_TYPE":
      return { ...state, loginType: action.payload }
    case "UPDATE_USER_LOGIN":
      return {
        ...state,
        userLogin: {
          ...state.userLogin,
          [action.payload.field]: action.payload.value
        }
      }
    case "COACH_FIRST_TIME":
      return {
        ...state,
        stage: 3,
        registration: {
          ...state.registration,
          coachId: action.payload
        }
      }
    case "UPDATE_FIELD_VALUE":
      return {
        ...state,
        registration: {
          ...state.registration,
          [action.payload.name]: action.payload.value
        }
      }
    case "CHANGE_CURRENT_STAGE":
      return {
        ...state,
        stage: action.payload
      }
    default:
      return state;
  }
}

export function coachfirstTimeRegistration(payload) {
  return {
    type: "COACH_FIRST_TIME",
    payload
  }
}

export function setFieldValue(name, value) {
  return {
    type: "UPDATE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}

export function changeCurrentStage(payload) {
  return {
    type: "CHANGE_CURRENT_STAGE",
    payload
  }
}

export function updateLoginType(payload) {
  return {
    type: "UPDATE_LOGIN_TYPE",
    payload
  }
}

export function updateUserLogin(field, value) {
  return {
    type: "UPDATE_USER_LOGIN",
    payload: { field, value }
  }
}