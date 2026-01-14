"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { socketInitialState } from "@/config/state-data/chat-scoket";
import { addNewMessageToCurrentChat, setCurrentUserMessages, socketReducer, storeChats, updateCurrentState } from "@/config/state-reducers/chat-scoket";
import { createContext, useContext, useEffect, useReducer } from "react"
import { io } from "socket.io-client";
import { useAppSelector } from "./global/hooks";

const ChatContext = createContext();

export function ClientChatStateProvider({ children }) {
  const { clientId, coachId } = useAppSelector(state => state.client.data)
  const [state, dispatch] = useReducer(socketReducer, socketInitialState);

  useEffect(function () {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT);
    socket.on("chatHistory", (data) => {
      dispatch(storeChats(data, socket))
      dispatch(setCurrentUserMessages(data))
    });
    socket.on("receiveMessage", (data) => {
      dispatch(addNewMessageToCurrentChat(data))
    });
    const emitData = {
      clientId,
      coachId,
      person: "client"
    }
    if (socket) socket.emit("joinRoom", emitData);
  }, [])

  if (state.state === "connecting") return <ContentLoader />

  if (state.state === "error") return <ContentError title={state?.message} />

  return <ChatContext.Provider value={{ ...state, dispatch }}>
    {children}
  </ChatContext.Provider>
}

export default function useClientChatSocketContext() {
  const context = useContext(ChatContext);
  return context;
}