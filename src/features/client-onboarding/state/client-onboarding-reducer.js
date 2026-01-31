export const clientOnboardingReducer = function (state, action) {
  switch (action.type) {
    case "UPDATE_FIELDS":
      return {
        ...state,
        ...action.payload
      }
    default:
      return state;
  }
}

export const createRequestPayload = function (state) {
  return {

  }
}

export const updateDetails = function (fields) {
  return {
    type: "UPDATE_FIELDS",
    payload: fields
  }
}