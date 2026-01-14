import { quickAddInitialState } from "../state-data/quick-add"

export function quickAddReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "QUICK_ADD_CLIENT_CREATED":
      return {
        ...quickAddInitialState,
        clientId: action.payload,
        view: 2
      }
    default:
      return state

  }
}

export function changeFieldvalue(name, value) {
  return {
    type: "CHANGE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}

export function quickAddClientCreated(clientId) {
  return {
    type: "QUICK_ADD_CLIENT_CREATED",
    payload: clientId
  }
}