import registerState from "../state-data/register";

export default function registerReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD_VALUE":
      return { ...state, [action.payload.name]: action.payload.value }

    default:
      return state;
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

export function init(payload) {
  return {
    ...registerState,
    coachId: payload.coachId
  }
}