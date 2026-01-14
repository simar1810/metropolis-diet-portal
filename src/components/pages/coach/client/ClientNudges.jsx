import ContentError from "@/components/common/ContentError"
import ContentLoader from "@/components/common/ContentLoader"
import ScheduleNotificationWrapper from "@/components/modals/client/ScheduleNotification"
import DualOptionActionModal from "@/components/modals/DualOptionActionModal"
import SelectMultiple from "@/components/SelectMultiple"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DAYS_EEEE } from "@/config/data/ui"
import { sendData } from "@/lib/api"
import { retrieveClientNudges } from "@/lib/fetchers/app"
import { getRecentNotifications, getReocurrNotification } from "@/lib/nudges"
import { cn } from "@/lib/utils"
import { addMonths, eachDayOfInterval, format, getDay, isSameDay, isToday, isValid, parse, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, EllipsisVertical, Eye, Pen, Trash2 } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import CopyClientNudges from "../copy-client-nudges/CopyClientNudges"
import CopyMealNotifications from "../copy-client-nudges/CopyMealNotifications"
import DeleteClientNudges from "./DeleteClientNudges"

export default function ClientNudges() {
  return
  const [selected, setSelected] = useState([])
  const { id } = useParams()
  const { isLoading, data, error } = useSWR(
    `client/nudges/${id}`,
    () => retrieveClientNudges(id, { limit: 10000000000 })
  )

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error?.message || data.message} />

  const notifications = data.data?.results || []

  return <div className="bg-white px-6 py-6 border-1 rounded-[10px] mt-4 w-[90vw] md:w-auto">
    {/* Header Section */}
    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
      <div className="mr-auto">
        <h4 className="text-xl font-semibold text-gray-900">Client Nudges</h4>
        <p className="text-sm text-gray-500 mt-1">{notifications.length ?? 0} Total Nudges</p>
      </div>
      <div className="flex items-center gap-3">
        <DeleteClientNudges clientId={id} />
        <ScheduleNotificationWrapper
          selectedClients={id}
        />
      </div>
    </div>

    {/* Action Buttons Section */}
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex-1">
          <h5 className="text-sm font-semibold text-gray-900 mb-1">Copy Nudges</h5>
          <p className="text-xs text-gray-600">Copy nudges from meal plans or other clients</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <CopyMealNotifications clientId={id} />
          <CopyClientNudges clientId={id} />
        </div>
      </div>
    </div>
    {notifications.length === 0
      ? <CreateFirstNotification />
      :
      <Tabs defaultValue="calendar" className="">
        <TabsList className="mb-4 bg-gray-100 p-1 rounded-lg border border-gray-200 inline-flex">
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-white data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-white data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all"
          >
            Recent
          </TabsTrigger>
          <TabsTrigger
            value="all-days"
            className="data-[state=active]:bg-white data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all"
          >
            Reocurr
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-sm px-4 py-2 rounded-md transition-all"
          >
            Schedule
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-0">
          <NudgesCalendar notifications={notifications} />
        </TabsContent>
        <TabsContent value="recent" className="mt-0">
          <NotificationRecent
            notifications={notifications}
            selected={selected}
          />
        </TabsContent>
        <TabsContent value="all-days" className="mt-0">
          <NotificationAllDays
            notifications={notifications.filter(notif => notif.schedule_type === "reocurr")}
            selected={selected}
          />
        </TabsContent>
        <TabsContent value="schedule" className="mt-0">
          <NotificationSchedule
            notifications={notifications.filter(notif => notif.schedule_type === "schedule")}
            selected={selected}
          />
        </TabsContent>
      </Tabs>}
  </div>
}

function CreateFirstNotification() {
  return <div className="h-40 p-4 mt-4 flex items-center justify-center bg-[var(--comp-1)] border-1 text-sm text-[#808080] font-bold rounded-[4px]">
    No Notifications found!
  </div>
}

// Helper function to parse date from "dd-MM-yyyy" or "dd-MM-yyyy HH:mm" format
function parseNotificationDate(dateStr) {
  if (!dateStr) return null;
  try {
    // Try "dd-MM-yyyy HH:mm" format first
    let parsed = parse(dateStr, "dd-MM-yyyy HH:mm", new Date());
    if (isValid(parsed)) return parsed;

    // Try "dd-MM-yyyy" format
    parsed = parse(dateStr, "dd-MM-yyyy", new Date());
    if (isValid(parsed)) return parsed;

    return null;
  } catch {
    return null;
  }
}

// Helper function to get status for a specific date from clientMarkedStatus
function getStatusForDate(notif, targetDate) {
  const clientMarkedStatus = Array.isArray(notif?.notificationStatus?.clientMarkedStatus)
    ? notif.notificationStatus.clientMarkedStatus
    : [];

  if (clientMarkedStatus.length === 0) return null;

  // Format target date as "dd-MM-yyyy" for comparison
  const targetDateStr = format(targetDate, "dd-MM-yyyy");

  // Find status entries that match the date (checking if date string starts with target date)
  const matchingEntries = clientMarkedStatus.filter(entry => {
    if (!entry?.date) return false;
    const entryDate = parseNotificationDate(entry.date);
    if (!entryDate) return false;
    return format(entryDate, "dd-MM-yyyy") === targetDateStr;
  });

  // Return the most recent matching entry (last in array)
  if (matchingEntries.length > 0) {
    const lastEntry = matchingEntries[matchingEntries.length - 1];
    return {
      status: lastEntry.status,
      imageLink: lastEntry.imageLink,
      date: lastEntry.date
    };
  }

  return null;
}

// Helper function to check if a recurring notification occurs on a specific date
function doesRecurringNotificationOccurOnDate(notif, date) {
  if (notif.schedule_type !== "reocurr") return false;
  if (!Array.isArray(notif.reocurrence) || notif.reocurrence.length === 0) return false;

  const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
  return notif.reocurrence.includes(dayOfWeek);
}

// Helper function to check if a scheduled notification is on a specific date
function isScheduledNotificationOnDate(notif, date) {
  if (notif.schedule_type !== "schedule") return false;
  if (!notif.date) return false;

  const notificationDate = parseNotificationDate(notif.date);
  if (!notificationDate) return false;

  return isSameDay(notificationDate, date);
}

function NudgesCalendar({ notifications }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const scrollContainerRef = useRef(null);
  const today = new Date();

  // Get all dates that have nudges (past 30 days + next 30 days)
  const dateRange = useMemo(() => {
    const startDate = subMonths(today, 1);
    const endDate = addMonths(today, 1);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, []);

  // Scroll to today's date on mount
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        const todayDate = new Date();
        const todayIndex = dateRange.findIndex(date => isSameDay(date, todayDate));
        if (todayIndex !== -1) {
          const dateButton = scrollContainerRef.current.children[todayIndex];
          if (dateButton) {
            // Scroll to center the current date
            dateButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            // Also set today as selected by default
            setSelectedDate(todayDate);
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [dateRange]);

  // Organize notifications by date
  const notificationsByDate = useMemo(() => {
    const map = new Map();

    dateRange.forEach(date => {
      const dateKey = format(date, "yyyy-MM-dd");
      const nudgesForDate = [];

      notifications.forEach(notif => {
        let shouldInclude = false;

        if (notif.schedule_type === "reocurr") {
          // For recurring, check if it occurs on this day of week
          shouldInclude = doesRecurringNotificationOccurOnDate(notif, date);
        } else if (notif.schedule_type === "schedule") {
          // For scheduled, check if it's on this exact date
          shouldInclude = isScheduledNotificationOnDate(notif, date);
        }

        if (shouldInclude) {
          const statusForDate = getStatusForDate(notif, date);
          nudgesForDate.push({
            ...notif,
            statusForDate, // Status specific to this date
            displayDate: date
          });
        }
      });

      if (nudgesForDate.length > 0) {
        map.set(dateKey, nudgesForDate);
      }
    });

    return map;
  }, [notifications, dateRange]);

  const selectedDateNudges = selectedDate
    ? notificationsByDate.get(format(selectedDate, "yyyy-MM-dd")) || []
    : [];

  return (
    <div className="space-y-4">
      {/* Horizontal Scrollable Date Picker */}
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          {dateRange.map((date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const nudgesForDate = notificationsByDate.get(dateKey) || [];
            const isSelected = isSameDay(selectedDate, date);
            const isCurrentDay = isToday(date);

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 w-20 p-3 rounded-lg border-2 transition-all cursor-pointer",
                  "flex flex-col items-center justify-center gap-1",
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300",
                  isCurrentDay && !isSelected && "border-green-400 bg-green-50"
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isCurrentDay ? "text-green-600" : isSelected ? "text-blue-600" : "text-gray-600"
                )}>
                  {format(date, "EEE")}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  isCurrentDay ? "text-green-600" : isSelected ? "text-blue-600" : "text-gray-900"
                )}>
                  {format(date, "d")}
                </span>
                <span className="text-[10px] text-gray-500">
                  {format(date, "MMM")}
                </span>
                {nudgesForDate.length > 0 && (
                  <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-500 text-white mt-1">
                    {nudgesForDate.length}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Nudges for {format(selectedDate, "dd MMMM, yyyy")}
            </h4>
            {selectedDateNudges.length > 0 && (
              <Badge className="bg-blue-500 text-white">
                {selectedDateNudges.length} {selectedDateNudges.length === 1 ? 'nudge' : 'nudges'}
              </Badge>
            )}
          </div>

          {selectedDateNudges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No nudges for this date</p>
          ) : (
            <div className="space-y-3">
              {selectedDateNudges.map((nudge) => (
                <DateNotificationItem
                  key={nudge._id}
                  nudge={nudge}
                  date={selectedDate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayNotificationItem({ notif, currentStatus, imageLink }) {
  const [showImage, setShowImage] = useState(false);

  return (
    <div className="p-3 border rounded-md my-2 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-gray-700 mb-1">
            Subject: <span className="text-black">{notif.subject}</span>
          </p>
          <p className="font-medium">
            Status:{" "}
            <span className="font-semibold text-blue-600">
              {currentStatus || "No Status"}
            </span>
          </p>
        </div>
        {imageLink && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowImage(!showImage)}
            className="h-7 w-7"
            title={showImage ? "Hide image" : "Show image"}
          >
            <Eye className={cn("h-4 w-4", showImage ? "text-blue-600" : "text-gray-500")} />
          </Button>
        )}
      </div>
      {imageLink && showImage && (
        <div className="mt-2">
          <Image
            src={imageLink}
            alt="status image"
            width={120}
            height={120}
            className="rounded-md border"
          />
        </div>
      )}
      {!imageLink && (
        <p className="text-gray-400 mt-1 text-sm">No Image</p>
      )}
    </div>
  );
}

function RecurringNotificationCard({ notif, currentStatus, imageLink }) {
  const { id } = useParams();
  const [showImage, setShowImage] = useState(false);
  const formattedTime = notif?.time || "--:--";

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900 mb-1 text-base">
                {notif.subject || "Untitled Notification"}
              </h5>
              {notif.message && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {notif.message}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className="p-0"
                >
                  <ScheduleNotificationWrapper
                    selectedClients={[id]}
                    defaultPayload={notif}
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                    >
                      <Pen className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </ScheduleNotificationWrapper>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className="p-0"
                >
                  <DeleteClientNotification id={notif._id}>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </AlertDialogTrigger>
                  </DeleteClientNotification>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge className="text-[10px] bg-blue-100 text-blue-700">
              Recurring
            </Badge>
            <span className="text-xs text-gray-500">🕒 {formattedTime}</span>
            {notif.notificationType && (
              <Badge variant="outline" className="text-[10px]">
                {notif.notificationType}
              </Badge>
            )}
          </div>

          {/* Status Display */}
          {currentStatus ? (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Latest Status:</span>
                  <Badge
                    className={cn(
                      "text-[10px]",
                      currentStatus === "Done"
                        ? "bg-green-100 text-green-800"
                        : currentStatus === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {currentStatus}
                  </Badge>
                </div>
                {imageLink && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowImage(!showImage)}
                    className="h-7 w-7"
                    title={showImage ? "Hide image" : "Show image"}
                  >
                    <Eye className={cn("h-4 w-4", showImage ? "text-blue-600" : "text-gray-500")} />
                  </Button>
                )}
              </div>
              {imageLink && showImage && (
                <div className="mt-3">
                  <Image
                    src={imageLink}
                    alt="Status image"
                    width={200}
                    height={200}
                    className="rounded-lg border border-gray-200 object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 text-center">No status update yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DateNotificationItem({ nudge, date }) {
  const { id } = useParams();
  const [showImage, setShowImage] = useState(false);
  const status = nudge.statusForDate;
  const formattedTime = nudge?.time || "--:--";

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-900 mb-1">
            {nudge.subject || "Untitled Notification"}
          </h5>
          <p className="text-sm text-gray-600 mb-2">
            {nudge.message || "No message"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={e => e.preventDefault()}
              className="p-0"
            >
              <ScheduleNotificationWrapper
                selectedClients={[id]}
                defaultPayload={nudge}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                >
                  <Pen className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </ScheduleNotificationWrapper>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={e => e.preventDefault()}
              className="p-0"
            >
              <DeleteClientNotification id={nudge._id}>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </AlertDialogTrigger>
              </DeleteClientNotification>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <Badge className="capitalize text-[10px]">{nudge.schedule_type}</Badge>
        <span className="text-xs text-gray-500">🕒 {formattedTime}</span>
        {nudge.notificationType && (
          <Badge variant="outline" className="text-[10px]">
            {nudge.notificationType}
          </Badge>
        )}
      </div>

      {/* Status Display */}
      {status ? (
        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Status:</span>
              <Badge
                className={cn(
                  "text-[10px]",
                  status.status === "Done"
                    ? "bg-green-100 text-green-800"
                    : status.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                )}
              >
                {status.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {status.date && (
                <span className="text-xs text-gray-500">
                  {(() => {
                    // Remove time from date if it exists (format: "dd-MM-yyyy HH:mm" -> "dd-MM-yyyy")
                    const dateStr = status.date;
                    if (dateStr && dateStr.includes(' ')) {
                      return dateStr.split(' ')[0];
                    }
                    return dateStr;
                  })()}
                </span>
              )}
              {status.imageLink && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowImage(!showImage)}
                  className="h-7 w-7"
                  title={showImage ? "Hide image" : "Show image"}
                >
                  <Eye className={cn("h-4 w-4", showImage ? "text-blue-600" : "text-gray-500")} />
                </Button>
              )}
            </div>
          </div>
          {status.imageLink && showImage && (
            <div className="mt-3">
              <Image
                src={status.imageLink}
                alt="Status image"
                width={200}
                height={200}
                className="rounded-lg border border-gray-200 object-cover"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 text-center">No status update for this date</p>
        </div>
      )}
    </div>
  );
}

const tabOptions = [
  { id: 1, name: "Recent", value: "recent" },
  { id: 2, name: "Reocurr", value: "all-days" },
  { id: 3, name: "Schedule", value: "schedule" },
]

function Header({
  selected,
  setSelected
}) {
  return <div className="my-4 flex flex-wrap items-center gap-4 select-none">
    <TabsList className="mr-auto bg-transpatent gap-2">
      {tabOptions.map(tab =>
        <TabsTrigger
          key={tab.id}
          className="md:min-w-[110px] mb-[-5px] px-2 font-semibold flex-1 basis-0 flex items-center gap-1 rounded-[10px] py-2
             data-[state=active]:bg-[var(--accent-1)] data-[state=active]:text-[var(--comp-1)]
             data-[state=active]:shadow-none text-[#808080] bg-[var(--comp-1)] border-1 border-[#EFEFEF]"
          value={tab.value}
        >
          {tab.name}
        </TabsTrigger>)}
    </TabsList>
    <SelectMultiple
      label="Days"
      align="top"
      options={DAYS_EEEE.map((day, idx) => ({
        id: idx,
        name: day,
        value: day
      }))}
      value={selected}
      onChange={value => setSelected(value)}

    />
  </div>
}

function NotificationRecent({
  notifications,
  selected
}) {
  const [paginate, setPaginate] = useState({
    page: 1,
    limit: 5
  })
  const sortedNotifications = getRecentNotifications(
    notifications,
    selected,
    paginate
  )

  return <TabsContent
    value="recent"
    className="bg-[var(--comp-1)] text-sm px-4 py-2 border-1 rounded-[6px]"
  >
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
      <p className="font-bold text-[16px] text-gray-900">Recent Notifications</p>
    </div>
    {sortedNotifications.length === 0 && <NoNotificationFound />}
    {sortedNotifications.map(notif => <NotificationItem
      key={notif._id}
      notif={notif}
    />)}
    {sortedNotifications.length > 0 && <Paginate
      paginate={paginate}
      setPaginate={setPaginate}
      totalPages={Math.ceil(notifications.length / paginate.limit)}
    />}
  </TabsContent>
}

function NotificationAllDays({
  notifications,
  selected,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filter recurring notifications
  const recurringNotifications = notifications.filter((n) => n.schedule_type === "reocurr");

  // Get notifications for selected day
  const notifForSelectedDay =
    selectedDay !== null
      ? recurringNotifications.filter((n) => n.reocurrence?.includes(selectedDay))
      : [];

  // Count notifications per day
  const getNotificationCount = (dayIndex) => {
    return recurringNotifications.filter((n) => n.reocurrence?.includes(dayIndex)).length;
  };

  return <TabsContent
    value="all-days"
    className="bg-[var(--comp-1)] text-sm px-4 py-2 border-1 rounded-[6px]"
  >
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
      <div>
        <p className="font-bold text-[16px] text-gray-900">Recurring Notifications</p>
        <p className="text-xs text-gray-500 mt-1">
          Select a day to view notifications scheduled for that day
        </p>
      </div>
      {recurringNotifications.length > 0 && (
        <Badge className="bg-blue-500 text-white">
          {recurringNotifications.length} Total
        </Badge>
      )}
    </div>

    {recurringNotifications.length === 0 ? (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-2">No recurring notifications found</p>
        <p className="text-sm text-gray-400">Create a recurring notification to see it here</p>
      </div>
    ) : (
      <>
        {/* Day Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Select Day of Week</p>
          <div className="grid grid-cols-7 gap-2">
            {weekDaysShort.map((day, index) => {
              const isActive = recurringNotifications.some((n) => n.reocurrence?.includes(index));
              const count = getNotificationCount(index);
              const isSelected = selectedDay === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(isSelected ? null : index)}
                  className={cn(
                    "p-3 rounded-lg text-center cursor-pointer border-2 transition-all",
                    "flex flex-col items-center justify-center gap-1",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-105"
                      : isActive
                        ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-white" : isActive ? "text-blue-700" : "text-gray-400"
                  )}>
                    {day}
                  </span>
                  {count > 0 && (
                    <Badge className={cn(
                      "text-[9px] px-1.5 py-0.5",
                      isSelected
                        ? "bg-white text-blue-600"
                        : "bg-blue-500 text-white"
                    )}>
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Notifications */}
        {selectedDay !== null && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Notifications for {weekDays[selectedDay]}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {notifForSelectedDay.length} notification{notifForSelectedDay.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDay(null)}
                className="text-xs"
              >
                Clear Selection
              </Button>
            </div>

            {notifForSelectedDay.length === 0 ? (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-500">No notifications scheduled for {weekDays[selectedDay]}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifForSelectedDay.map((notif) => {
                  // Get the most recent status from clientMarkedStatus array (last item)
                  const clientMarkedStatus = Array.isArray(notif?.notificationStatus?.clientMarkedStatus)
                    ? notif.notificationStatus.clientMarkedStatus
                    : [];
                  const currentStatus = clientMarkedStatus.length > 0
                    ? clientMarkedStatus[clientMarkedStatus.length - 1]?.status
                    : null;

                  const matchedEntry = notif.notificationStatus?.clientMarkedStatus?.find(
                    (entry) => entry.status === currentStatus
                  );

                  const imageLink = matchedEntry?.imageLink || null;

                  return (
                    <RecurringNotificationCard
                      key={notif._id}
                      notif={notif}
                      currentStatus={currentStatus}
                      imageLink={imageLink}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Show hint if no day selected */}
        {selectedDay === null && (
          <div className="py-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500 text-sm">
              👆 Select a day above to view notifications scheduled for that day
            </p>
          </div>
        )}
      </>
    )}
  </TabsContent>
}

function NotificationSchedule({
  notifications,
  selected,
}) {
  const [paginate, setPaginate] = useState({
    page: 1,
    limit: 5
  })
  const sortedNotifications = getReocurrNotification(
    notifications,
    selected,
    paginate
  )

  return <TabsContent
    value="schedule"
    className="bg-[var(--comp-1)] text-sm px-4 py-2 border-1 rounded-[6px]"
  >
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
      <p className="font-bold text-[16px] text-gray-900">Scheduled Notifications</p>
    </div>
    {sortedNotifications.length === 0 && <NoNotificationFound />}
    {sortedNotifications.map(notif => <NotificationItem
      key={notif._id}
      notif={notif}
    />)}
    {sortedNotifications.length > 0 && <Paginate
      paginate={paginate}
      setPaginate={setPaginate}
      totalPages={Math.ceil(notifications.length / paginate.limit)}
    />}
  </TabsContent>
}

function NotificationItem({ notif }) {
  const { id } = useParams();
  const [selectedStatusImage, setSelectedStatusImage] = useState(null);
  const [showStatusImage, setShowStatusImage] = useState(false);

  const isSeen = notif?.isRead;
  const formattedTime = notif?.time || "--:--";
  const formattedDate = notif?.date || "--/--/----";

  // Get status options if available
  const possibleStatuses = Array.isArray(notif?.notificationStatus?.possibleStatus)
    ? notif.notificationStatus.possibleStatus
    : [];
  // Ensure defaultStatus is always an array, not a string
  const defaultStatus = Array.isArray(notif?.notificationStatus?.clientMarkedStatus)
    ? notif.notificationStatus.clientMarkedStatus
    : [];
  // Safely access status from the LAST item (most recent) if it exists
  // The array is ordered chronologically, with the most recent status at the end
  const status = defaultStatus.length > 0
    ? defaultStatus[defaultStatus.length - 1]?.status || null
    : null;
  const imageUrlFromStatus = Array.isArray(notif?.notificationStatus?.clientMarkedStatus)
    ? notif.notificationStatus.clientMarkedStatus.find(entry => entry?.imageLink)?.imageLink
    : null;
  const imageUrl =
    imageUrlFromStatus ||
    notif?.imageUrl ||
    notif?.attachment ||
    notif?.photo ||
    null;
  return (
    <div
      className={cn(
        "border rounded-2xl px-4 py-3 mb-3 flex flex-col gap-3 transition hover:shadow-sm",
        isSeen ? "bg-white" : "bg-[#f9fafb]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm md:!text-lg">
                {notif.subject || "Untitled Notification"}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 ml-2 shrink-0"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className="p-0"
                >
                  <ScheduleNotificationWrapper
                    selectedClients={[id]}
                    defaultPayload={notif}
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                    >
                      <Pen className="w-4 h-4 text-gray-600" />
                      <span>Edit notification</span>
                    </button>
                  </ScheduleNotificationWrapper>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className="p-0"
                >
                  {/* <ScheduleNotificationWrapper
                    defaultPayload={{
                      ...notif,
                      _id: undefined
                    }}
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                      <span>Copy notification</span>
                    </button>
                  </ScheduleNotificationWrapper> */}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  className="p-0"
                >
                  <DeleteClientNotification id={notif._id}>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                        <span>Delete notification</span>
                      </button>
                    </AlertDialogTrigger>
                  </DeleteClientNotification>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {notif.message || "No message provided."}
          </p>

          {/* Display Image if available */}
          {selectedStatusImage && showStatusImage && (
            <div className="mb-2 mt-2">
              <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <Image
                  src={selectedStatusImage}
                  alt={notif.subject || "Notification image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Display Status Options if available */}
          {possibleStatuses.length > 0 && (
            <div className="mt-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-700">Status Options:</span>
                {possibleStatuses.map((status, index) => {
                  const statusName = typeof status === "string" ? status : status.name;
                  const imageForStatus =
                    notif?.notificationStatus?.clientMarkedStatus?.find(
                      (entry) => entry.status === statusName
                    )?.imageLink || null;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded px-2 py-0.5"
                    >
                      <span className="text-[10px] font-medium text-gray-700">
                        {statusName}
                      </span>
                      {imageForStatus && (
                        <button
                          onClick={() => {
                            setSelectedStatusImage(imageForStatus);
                            setShowStatusImage(!showStatusImage);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {status && possibleStatuses.some(s => {
                const statusName = typeof s === "string" ? s : s?.name;
                return statusName === status;
              }) && (
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Current Status:</span>{" "}
                    <Badge className="text-[10px] font-medium px-2 py-0.5 bg-blue-100 text-blue-800 border-blue-300 ml-1">
                      {status}
                    </Badge>
                  </div>
                )}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <Badge className="capitalize text-[10px] font-bold">{notif.schedule_type}</Badge>
            {notif.schedule_type === "schedule" && (
              <span>
                📅 {formattedDate} •
              </span>
            )}
            <span>🕒 {formattedTime}</span>
            {notif.notificationType && (
              <span className="px-2 py-0.5 bg-gray-100 rounded-full border text-gray-700">
                {notif.notificationType}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationReadStatus({ isSeen }) {
  if (isSeen) return <Badge className="text-green-500 font-bold px-1 py-[2px] text-[10px] bg-transparent">
    Seen
    <span className="h-2 w-2 bg-green-500 rounded-full inline-block ml-1" />
  </Badge>

  return <Badge className="text-red-500 font-bold px-1 py-[2px] text-[10px] bg-transparent">
    Unseen
    <span className="h-2 w-2 bg-red-500 rounded-full inline-block ml-1" />
  </Badge>
}

function DeleteClientNotification({ id, children }) {
  const { id: clientId } = useParams()
  async function deleteNotification(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/notifications-schedule", { actionType: "DELETE", id }, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      closeBtnRef.current.click();
      mutate(`client/nudges/${clientId}`)
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure of deleting this notification!"
    action={(setLoading, btnRef) => deleteNotification(setLoading, btnRef)}
  >
    {!children && <AlertDialogTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <Trash2 className="w-4 h-4 text-[var(--accent-2)]" />
      </Button>
    </AlertDialogTrigger>}
    {children}
  </DualOptionActionModal>
}

function Paginate({
  paginate = {},
  setPaginate,
  totalPages = 10
}) {
  return <div className="mt-4 flex items-center justify-between gap-4">
    <Select
      value={paginate.limit}
      onValueChange={value => setPaginate({ ...paginate, limit: value })}
    >
      <SelectTrigger className="bg-white">
        <SelectValue value={paginate.limit} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={5}>5</SelectItem>
        <SelectItem value={10}>10</SelectItem>
        <SelectItem value={15}>15</SelectItem>
      </SelectContent>
    </Select>
    <PaginatePages
      paginate={paginate}
      setPaginate={setPaginate}
      totalPages={totalPages}
    />
  </div>
}

function PaginatePages({ paginate, setPaginate, totalPages = 20 }) {
  const { page } = paginate;

  const handlePageChange = (value) => {
    if (value < 1 || value > totalPages) return;
    setPaginate({ ...paginate, page: value });
  };

  const startPage = Math.floor((page - 1) / 4) * 4 + 1;
  const endPage = Math.min(startPage + 3, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="bg-white flex items-center justify-center mt-4">
      <Button
        size="icon"
        variant="outline"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="rounded-none w-8 h-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {visiblePages.map((num) => (
        <Button
          key={num}
          onClick={() => handlePageChange(num)}
          variant={num === page ? "default" : "outline"}
          className={`w-8 h-8 text-sm rounded-none transition-all ${num === page
            ? "bg-black text-white hover:bg-black"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          {num}
        </Button>
      ))}
      <Button
        size="icon"
        variant="outline"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-none w-8 h-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function NoNotificationFound() {
  return <div className="h-32 flex flex-col items-center justify-center text-center text-gray-500">
    <div className="text-sm font-medium">No notifications found</div>
    <p className="text-xs text-gray-400 mt-1">Nothing here yet. Create your first notification.</p>
  </div>
}