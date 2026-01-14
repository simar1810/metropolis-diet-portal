export function copyClientNudgesReducer(state, action) {
  switch (action.type) {
    case "SELECT_CLIENT":
      return {
        ...state,
        selectedClient: action.payload
      }
    case "SELECT_STAGE":
      return {
        ...state,
        stage: action.payload
      }
    case "SELECT_CURRENT_CLIENT_NUDGES":
      return {
        ...state,
        nudgesPulledFrom: state.selectedClient
      }
    case "PULLED_CLIENT_NUDGES":
      return {
        ...state,
        clientNudges: action.payload
      }
    case "TOGGLE_NOTIFICATION_SELECTION":
      return {
        ...state,
        clientNudges: state
          .clientNudges
          .map(notification => notification._id === action.payload
            ? ({ ...notification, selected: !notification.selected })
            : notification)
      }
    case "SELECT_ALL_NOTIFICATIONS":
      return {
        ...state,
        clientNudges: state
          .clientNudges
          .map(notification => ({
            ...notification,
            selected: true
          }))
      }
    case "DESELECT_ALL_NOTIFICATIONS":
      return {
        ...state,
        clientNudges: state
          .clientNudges
          .map(notification => ({
            ...notification,
            selected: false
          }))
      }
    default:
      return state;
  }
}

export function selectCopyNudgeClient(payload) {
  return {
    type: "SELECT_CLIENT",
    payload: payload
  }
}

export function selectCurrentClientNudges() {
  return {
    type: "SELECT_CURRENT_CLIENT_NUDGES"
  }
}

export function selectCopyClientNudgeStage(payload) {
  return {
    type: "SELECT_STAGE",
    payload
  }
}

export function pulledClientNudges(payload) {
  const notifications = payload.map(notification => ({
    _id: notification._id,
    selected: true
  }))
  return {
    type: "PULLED_CLIENT_NUDGES",
    payload: notifications
  }
}

export function toggleNotificationSelection(payload) {
  return {
    type: "TOGGLE_NOTIFICATION_SELECTION",
    payload
  }
}

export function selectAllNotifications() {
  return {
    type: "SELECT_ALL_NOTIFICATIONS"
  }
}

export function deselectAllNotifications() {
  return {
    type: "DESELECT_ALL_NOTIFICATIONS"
  }
}