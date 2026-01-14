import { membershipState } from "../state-data/request-membership";

export function membershipReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD_VALUE":
      return { ...state, [action.payload.name]: action.payload.value };
    case "RESET_STATE":
      return membershipState;
    default:
      return state;
  }
}

export function onChangeField(name, value) {
  return {
    type: "UPDATE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}