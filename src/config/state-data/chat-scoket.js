export const socketInitialState = {
  socket: false,
  state: "connecting", // e.g. connecting, connected, not-connected, error, joining-room
  currentChat: null,
  inbox: {
    message: "",
    file: null
  },
  currentChatMessages: []
}