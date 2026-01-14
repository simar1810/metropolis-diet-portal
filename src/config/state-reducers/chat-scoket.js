export function socketReducer(state, action) {
  switch (action.type) {
    case "UPDATE_CURRENT_STATE":
      return {
        ...state,
        state: action.payload.state,
        message: action.payload.message
      }

    case "STORE_CHATS":
      return {
        ...state,
        message: "",
        state: "connected",
        chats: action.payload.chats,
        socket: action.payload.socket || state.socket,
      }

    case "SELECT_CHAT_USER":
      return {
        ...state,
        currentChat: action.payload,
        state: "joining-room"
      }

    case "SET_CURRENT_USER_MESSAGES":
      return {
        ...state,
        currentChatMessages: action.payload,
        state: "connected"
      }

    case "ADD_NEW_MESSAGE_TO_CURRENT_CHAT":
      return {
        ...state,
        currentChatMessages: [...state.currentChatMessages, action.payload]
      }

    default:
      state;
  }
}

export function updateCurrentState(state, message) {
  return {
    type: "UPDATE_CURRENT_STATE",
    payload: {
      state,
      message
    }
  }
}

export function storeChats(chats, socket) {
  return {
    type: "STORE_CHATS",
    payload: {
      chats,
      socket
    }
  }
}

export function selectChatUser(chat) {
  return {
    type: "SELECT_CHAT_USER",
    payload: chat
  }
}

export function setCurrentUserMessages(payload) {
  return {
    type: "SET_CURRENT_USER_MESSAGES",
    payload
  }
}

export function addNewMessageToCurrentChat(payload) {
  return {
    type: "ADD_NEW_MESSAGE_TO_CURRENT_CHAT",
    payload
  }
}

export function socketinit() {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT);

  return socket;
}