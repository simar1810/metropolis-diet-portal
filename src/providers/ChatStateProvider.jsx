"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { socketInitialState } from "@/config/state-data/chat-scoket";
import { addNewMessageToCurrentChat, setCurrentUserMessages, socketReducer, storeChats, updateCurrentState } from "@/config/state-reducers/chat-scoket";
import { getAllChatClients } from "@/lib/fetchers/app";
import { createContext, useContext, useEffect, useReducer } from "react"
import { io } from "socket.io-client";
import useSWR from "swr";

const ChatContext = createContext();

export function ChatSocketProvider({ children }) {
  const { isLoading, data } = useSWR("app/getAllChatClients", getAllChatClients)
  const [state, dispatch] = useReducer(socketReducer, socketInitialState);

  useEffect(function () {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT);
    socket.on("chatHistory", (data) => dispatch(setCurrentUserMessages(data)));
    socket.on("receiveMessage", (data) => dispatch(addNewMessageToCurrentChat(data)));
    (async function () {
      try {
        if (!data) return
        if (!isLoading && data.status_code !== 200) throw new Error(data?.message);
        dispatch(storeChats(data.data, socket))
      } catch (error) {
        dispatch(updateCurrentState("error", error.message || "An unknown error occured!"))
      }
    })();
  }, [isLoading])

  if (state.state === "connecting") return <ContentLoader />

  if (state.state === "error") return <ContentError title={state?.message} />

  return <ChatContext.Provider value={{ ...state, dispatch }}>
    {children}
  </ChatContext.Provider>
}

export default function useChatSocketContext() {
  const context = useContext(ChatContext);
  return context;
}