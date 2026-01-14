"use client";
import Loader from "@/components/common/Loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectChatUser } from "@/config/state-reducers/chat-scoket";
import useDebounce from "@/hooks/useDebounce";
import useKeyPress from "@/hooks/useKeyPress";
import { formatMessage, getRelativeTime, nameInitials } from "@/lib/formatter";
import { cn, copyText } from "@/lib/utils";
import useChatSocketContext, { ChatSocketProvider } from "@/providers/ChatStateProvider";
import { useAppSelector } from "@/providers/global/hooks";
import { CheckCheck, Clipboard, ClipboardCheck, Copy, EllipsisVertical, Paperclip, SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  return <div className="content-container bg-white p-4 pt-0 rounded-md border-1">
    <ChatSocketProvider>
      <ChatContainer />
    </ChatSocketProvider>
  </div>
}

function ChatContainer() {
  const { currentChat } = useChatSocketContext();

  return <div className="mt-4 flex flex-col gap-10 md:gap-0 md:flex-row">
    <div className="md:w-[400px] md:pr-10">
      {/* <div className="pb-4 flex items-center gap-2 border-b-1">
        <Button variant="wz" size="sm" className="rounded-full">All Chats</Button>
        <Button variant="wz" size="sm" className="rounded-full">Personal</Button>
      </div> */}
      <AllChatListings />
    </div>
    {currentChat
      ? <SelectedChat />
      : <div className="bg-[var(--comp-1)] content-height-screen grow flex items-center justify-center">
        <h4>Please Select a Chat 😊</h4>
      </div>}
  </div>
}

function AllChatListings() {
  const { chats, currentChat } = useChatSocketContext();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);

  const selectedChats = useMemo(() => chats.filter(chat => chat.name.toLowerCase().includes(debouncedQuery.toLowerCase())));

  return <div className="w-full">
    <div className="mb-4 relative">
      <Input
        placeholder="Search messages"
        className="w-full bg-[#F4F4F4]/25"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {debouncedQuery !== query && <Loader className="!w-6 absolute right-2 top-1/2 translate-y-[-50%]" />}
    </div>
    <div className="w-full pb-4 h-[450px] divide-y-2 divide-[var(--comp-1)] overflow-y-auto">
      {selectedChats.map(chat => <ChatPersonCard
        key={chat._id}
        chat={chat}
        selectedId={currentChat?._id}
      />)}
      {selectedChats.length === 0 && <div className="min-h-[400px] leading-[400px] font-bold text-center">No Chats Found!</div>}
    </div>
  </div>
}

function ChatPersonCard({ chat, selectedId }) {
  const { dispatch } = useChatSocketContext();
  return <div
    className={`px-4 py-1 flex items-center gap-4 relative cursor-pointer hover:bg-[var(--comp-1)] rounded-[8px] ${selectedId === chat._id && "bg-[var(--comp-1)]"}`}
    onClick={() => dispatch(selectChatUser(chat))}
  >
    <Avatar className="h-[48px] w-[48px] rounded-[4px]">
      <AvatarImage src={chat.profilePhoto} className="rounded-[8px]" />
      <AvatarFallback className="rounded-[8px]">{nameInitials(chat.name)}</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-[16px] font-semibold mb-[2px]">{chat.name}</p>
      <p className="leading-[1] text-[#82867E] text-[12px]">{chat.latestMessage}</p>
    </div>
    <span className="text-[11px] text-[#82867E] absolute top-4 right-2">{getRelativeTime(chat.latestMessageTime)}</span>
  </div>
}

function SelectedChat() {
  const { socket, currentChat, state } = useChatSocketContext();
  useEffect(function () {
    const data = {
      coachId: currentChat.coachID,
      clientId: currentChat.clientID,
      person: "coach"
    }
    socket.emit("joinRoom", data);
    socket.emit("seenMessages", data);
  }, [currentChat._id]);

  if (state === "joining-room") return <div className="bg-[var(--comp-1)] content-height-screen grow flex items-center justify-center">
    <h4>Please Wait Opening Chat 😊</h4>
  </div>

  return <div className="relative grow md:w-[200px] flex flex-col border-1 overflow-x-clip">
    <CurrentChatHeader />
    <div className="text-[12px] font-semibold py-2 px-6">
      <ChatMessages />
    </div>
    <CurrentChatMessageBox />
  </div>
}

function CurrentChatHeader() {
  const { currentChat } = useChatSocketContext();
  return <div className="bg-[var(--primary-1)] px-4 py-4 flex items-center gap-4 sticky top-0 z-[10] border-b-1">
    <Avatar className="h-[48px] w-[48px] rounded-[4px]">
      <AvatarImage src={currentChat.profilePhoto || "/"} className="rounded-[8px]" />
      <AvatarFallback className="bg-gray-200 rounded-[8px]">{nameInitials(currentChat.name)}</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-[16px] font-semibold mb-[2px]">{currentChat.name}</p>
      <p className="leading-[1] text-[#82867E] text-[12px]">Active Now</p>
    </div>
    <EllipsisVertical className="ml-auto text-[#D9D9D9]" />
  </div>
}

function ChatMessages() {
  const { currentChatMessages } = useChatSocketContext();
  const messsageContainerRef = useRef();

  useEffect(function () {
    if (messsageContainerRef.current) {
      messsageContainerRef.current.scrollTop = messsageContainerRef.current.scrollHeight;
    }
  }, [currentChatMessages.length])

  return <div ref={messsageContainerRef} className="h-96 pr-4 overflow-y-auto">
    {currentChatMessages.map(message => message.person === "coach"
      ? <CurrentUserMessage key={message.createdAt} message={message} />
      : <CompanionUserMessage key={message.createdAt} message={message} />)}
  </div>
}

function CurrentChatMessageBox() {
  const [message, setMessage] = useState("");
  const { socket, currentChat } = useChatSocketContext();
  useKeyPress("Enter", sendMessage);

  const data = {
    coachId: currentChat.coachID,
    clientId: currentChat.clientID,
    person: "coach",
    message
  }

  function sendMessage() {
    socket.emit("sendMessage", data);
    setMessage("");
  }

  return <div className="mx-4 py-4 mt-auto flex items-center gap-4 border-t-1">
    {/* <Paperclip className="text-[#535353] w-[18px]" /> */}
    <Input
      value={message}
      onChange={e => setMessage(e.target.value)}
      placeholder="Write a Message"
      className="px-0 border-0 shadow-none focus:shadow-none"
    />
    <Button variant="wz" onClick={sendMessage}>
      <SendHorizontal />
      Send
    </Button>
  </div>
}

function CurrentUserMessage({ message }) {
  const [showOptions, setShowOptions] = useState(false)
  const coach = useAppSelector(state => state.coach.data)
  if (!message || !message?.message) return;
  return <div
    className="mb-4 flex flex-wrap items-start justify-end gap-4"
    onMouseOver={() => setShowOptions(true)}
    onMouseOut={() => setShowOptions(false)}
  >
    <div className="relative">
      <div
        className="max-w-[80ch] bg-[var(--accent-1)] text-white relative px-4 py-2 rounded-[20px] rounded-br-0"
        style={{ borderBottomRightRadius: 0 }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: formatMessage(message?.message) }}
        />
        {message.seen && <CheckCheck className="w-3 h-3 text-[#0045CC] absolute bottom-[2px] right-[2px]" />}
      </div>
      <p className="text-[var(--dark-1)]/25 mt-1 text-right">{getRelativeTime(message.createdAt)}</p>
      {showOptions && <Options
        user="current"
        message={message?.message}
      />}
    </div>
    <Avatar className="rounded-[4px] mt-1">
      <AvatarImage src={coach.profilePhoto || "/"} />
      <AvatarFallback className="rounded-[4px]">{nameInitials(coach.name)}</AvatarFallback>
    </Avatar>
  </div>
}

function CompanionUserMessage({ message }) {
  const [showOptions, setShowOptions] = useState(false)
  const { currentChat } = useChatSocketContext();
  if (!message || !message?.message) return;
  return <div
    onMouseOver={() => setShowOptions(true)}
    onMouseOut={() => setShowOptions(false)}
    className="mb-4 flex flex-wrap items-start justify-start gap-4 relative">
    <Avatar className="rounded-[4px] mt-1">
      <AvatarImage src={currentChat.profilePhoto || "/"} />
      <AvatarFallback className="rounded-[4px]">{nameInitials(currentChat.name)}</AvatarFallback>
    </Avatar>
    <div className="relative">
      <div
        className="max-w-[40ch] bg-[var(--comp-1)] text-black px-4 py-2 rounded-[20px] rounded-br-0"
        style={{ borderBottomLeftRadius: 0 }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: formatMessage(message?.message) }}
        />
      </div>
      <p className="text-[var(--dark-1)]/25 mt-1">{getRelativeTime(message.createdAt)}</p>
      {showOptions && <Options message={message?.message} />}
    </div>
  </div>
}

export function Options({
  user = "companion",
  message
}) {
  return <button className={cn(
    "absolute top-0 translate-y-1 p-1 bg-[var(--comp-1)] border-1 hover:rounded-[4px] hover:scale-[1.1]",
    user === "companion" ? "left-full translate-x-2" : "right-full -translate-x-2"
  )}>
    <ClipboardCheck
      onClick={() => {
        copyText(message)
        toast.success("Copied!")
      }}
      className="h-[14px] w-[14px] " />
  </button>
}