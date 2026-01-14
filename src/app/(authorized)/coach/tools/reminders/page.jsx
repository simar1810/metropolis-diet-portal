"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import NoData from "@/components/common/NoData";
import ReminderModal from "@/components/modals/tools/ReminderModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DialogTrigger } from "@/components/ui/dialog";
import { getReminders } from "@/lib/fetchers/app";
import { nameInitials } from "@/lib/formatter";
import { addDays, format, parse, set } from "date-fns";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
const dates = generateDatesPayload();

export default function Page() {
  const { isLoading, error, data } = useSWR("app/getAllReminder?person=coach", () => getReminders());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "dd-MM-yyyy"));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const selectedDateFormat = format(parse(selectedDate, 'dd-MM-yyyy', new Date()), 'yyyy-MM-dd');
  const reminders = data.data.filter(reminder => reminder.date === selectedDate || reminder.date === selectedDateFormat)

  if (reminders.length === 0) return <div className="content-container content-height-screen flex flex-col items-center justify-center">
    <NotesPageHeader />
    <DatesListing
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
    <div className="my-auto">
      <NoData message="No Reminders Available" />
    </div>
  </div>

  return <div className="content-container content-height-screen">
    <NotesPageHeader />
    <DatesListing
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
    <RemindersListing reminders={reminders} />
  </div>
}

function NotesPageHeader() {
  return <div className="w-full mb-4 flex items-center gap-4">
    <h4 className="mr-auto">Reminders</h4>
    <ReminderModal>
      <DialogTrigger className="bg-[var(--accent-1)] text-white text-[14px] font-bold px-2 py-1 flex items-center gap-1 rounded-[8px]">
        <Plus className="w-[16px]" />
        Create New
      </DialogTrigger>
    </ReminderModal>
  </div>
}

function DatesListing({
  selectedDate,
  setSelectedDate
}) {
  const datesContainer = useRef();

  useEffect(() => {
    const container = datesContainer.current;
    if (container) {
      const scrollAmount = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollLeft = scrollAmount;
    }
  }, []);

  return <div ref={datesContainer} className="w-[calc(100vw-344px)] text-center overflow-auto no-scrollbar">
    <div className="w-[calc(120px*30)] flex overflow-clip">
      {dates.map(date => <div
        key={date.id}
        className={`w-[120px] px-1 py-1 rounded-[8px] cursor-pointer ${selectedDate === date.date && "bg-[var(--accent-1)] text-white font-semibold"} `}
        onClick={() => setSelectedDate(date.date)}
      >
        <p>{date.date.split("-")[0]}</p>
        <p className="text-[12px]">{date.day.slice(0, 2)}</p>
      </div>)}
    </div>
  </div>
}

function RemindersListing({ reminders }) {
  return <div className="mt-10">
    {reminders.map(reminder => <Reminder
      key={reminder._id}
      reminder={reminder}
    />)}
  </div>
}

function Reminder({ reminder }) {
  return <div className="px-4 py-2 flex items-start gap-6">
    <p>{reminder.time}</p>
    <div className="max-w-[600px] w-full bg-[var(--accent-1)] p-4 rounded-[8px]">
      <div className="mb-2 flex items-start gap-2">
        <div className="mr-auto">
          <p className="text-white text-[16px] font-semibold">{reminder.agenda}</p>
          <p className="text-[12px] leading-[1]">{reminder.topic}</p>
        </div>
        <ReminderModal
          type="UPDATE"
          payload={reminder}
        >
          <DialogTrigger>
            <PenLine className="w-[20px] h-[20px] bg-white p-1 rounded-[4px] cursor-pointer" />
          </DialogTrigger>
        </ReminderModal>
        {/* <Trash2 className="w-[20px] h-[20px] text-[var(--accent-2)] bg-white p-1 rounded-[4px] cursor-pointer" /> */}
      </div>
      <Avatar>
        <AvatarFallback>{nameInitials(reminder.client.name || "N A")}</AvatarFallback>
      </Avatar>
    </div>
  </div>
}

function generateDatesPayload() {
  const dates = [];
  for (let i = -15; i < 15; i++) {
    dates.push({
      id: 16 + i,
      date: format(addDays(new Date(), i), 'dd-MM-yyyy'),
      day: format(addDays(new Date(), i), 'E'),
    })
  }
  return dates;
}