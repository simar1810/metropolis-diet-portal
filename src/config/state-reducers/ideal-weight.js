export function idealWeightReducer(state, action) {
  switch (action.type) {
    case "CHANGE_GENDER":
      return {
        ...state,
        gender: action.payload
      }
    case "CHANGE_HEIGHT_UNIT":
      return {
        ...state,
        heightUnit: action.payload
      }

    default:
      return state;
  }
}

export function changeGender(gender) {
  return {
    type: "CHANGE_GENDER",
    payload: gender
  }
}

export function changeHeightUnit(unit) {
  return {
    type: "CHANGE_HEIGHT_UNIT",
    payload: unit
  }
}