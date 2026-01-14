import Loader from "@/components/common/Loader";
import TimePicker from "@/components/common/TimePicker";
import FormControl from "@/components/FormControl";
import SelectMultiple from "@/components/SelectMultiple";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNotificationSchedulerCache } from "@/hooks/useNotificationSchedulerCache";
import { sendData } from "@/lib/api";
import { retrieveClientNudges, retrieveCoachClientList } from "@/lib/fetchers/app";
import { _throwError } from "@/lib/formatter";
import { format, isValid, parse, parseISO } from "date-fns";
import { Calendar, CircleMinus, CirclePlus, Clock, History, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

// Helper function to convert 24-hour time format to 12-hour format for TimePicker
function convertTimeTo12Hour(timeStr) {
  if (!timeStr) return "";

  try {
    const trimmed = timeStr.trim();

    // Already in 12-hour format (e.g., "08:00 PM" or "8:00 am")
    if (/[ap]m$/i.test(trimmed)) {
      // Normalize the format to ensure it's in "hh:mm a" format
      try {
        const parsed = parse(trimmed, "hh:mm a", new Date());
        return format(parsed, "hh:mm a");
      } catch {
        return trimmed;
      }
    }

    // Handle 24-hour format with or without seconds (e.g., "21:37:00" or "21:37")
    // Extract just hours and minutes
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);

      // Validate hours and minutes
      if (isNaN(hours) || hours < 0 || hours > 23) {
        return "";
      }
      if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        return "";
      }

      // Create a date object to use date-fns formatting
      // Use a fixed date to avoid timezone issues
      const date = new Date(2000, 0, 1, hours, minutes, 0);

      return format(date, "hh:mm a");
    }

    return "";
  } catch (error) {
    return "";
  }
}

export default function ScheduleNotificationWrapper({
  children,
  selectedClients,
  defaultPayload = {}
}) {
  const { data, isLoading, error } = useSWR("coach-client-list", () => retrieveCoachClientList())

  if (isLoading) return <Loader />

  if (error || data.status_code !== 200) {
    toast.error(data.message || error || "Something went wrong!")
    return
  }

  const clients = (data.data || []).map((client, index) => ({
    id: index + 1,
    name: client.name,
    value: client._id
  }))

  return <ScheduleNotification
    children={children}
    selectedClients={selectedClients}
    clients={clients}
    defaultPayload={defaultPayload}
  />
}

export function formatDate(date) {
  if (!date) return "";
  try {
    const formats = ["dd-MM-yyyy", "yyyy-MM-dd"];
    let parsedDate = null;
    for (const fmt of formats) {
      const attempt = parse(date, fmt, new Date());
      if (isValid(attempt)) {
        parsedDate = attempt;
        break;
      }
    }
    if (!parsedDate) return "";
    return format(parsedDate, "yyyy-MM-dd");
  } catch (error) {
    return "";
  }
}


function formatTime(timeStr) {
  if (!timeStr) return "00:00"

  try {
    // Handle TimePicker format (hh:mm a) - like "02:30 PM"
    if (timeStr.match(/^\d{1,2}:\d{2}\s+(AM|PM)$/i)) {
      const parsed = parse(timeStr, "hh:mm a", new Date())
      return format(parsed, "HH:mm")
    }

    // Handle 24-hour format (HH:mm) - like "14:30"
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return `${timeStr}:00`
    }
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr
    }

    return "00:00"
  } catch (error) {
    return "00:00"
  }
}


function ScheduleNotification({
  children,
  clients,
  selectedClients,
  defaultPayload
}) {
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const subjectRef = useRef(null);
  const dropdownRef = useRef(null);

  const { id: currentClientId } = useParams()

  const {
    getCachedNotificationsByContext,
    getCachedNotificationsForClientByContext
  } = useNotificationSchedulerCache();
    function normalizeTime(timeStr) {
        if (!timeStr) return "";
        // First try to convert from 24-hour format to 12-hour format
        const converted = convertTimeTo12Hour(timeStr);
        if (converted) {
            return converted; // Return the string directly
        }
        // If already in 12-hour format, return as is
        if (timeStr.match(/^\d{1,2}:\d{2}\s+(AM|PM)$/i)) {
            return timeStr;
        }
        return "";
    }
    
    function parseDateForInput(dateStr) {
        if (!dateStr) return "";
        try {
            let parsed = null;
            // Try parsing as "dd-MM-yyyy" format first (most common in this app)
            parsed = parse(dateStr, "dd-MM-yyyy", new Date());
            if (isValid(parsed)) {
                return format(parsed, "yyyy-MM-dd");
            }
            // Try ISO format
            parsed = parseISO(dateStr);
            if (isValid(parsed)) {
                return format(parsed, "yyyy-MM-dd");
            }
            // Try "yyyy-MM-dd" format
            parsed = parse(dateStr, "yyyy-MM-dd", new Date());
            if (isValid(parsed)) {
                return format(parsed, "yyyy-MM-dd");
            }
            return "";
        } catch {
            return "";
        }
    }
    
    const [payload, setPayload] = useState({
        subject: defaultPayload.subject || "",
        message: defaultPayload.message || "",
        notificationType: defaultPayload.schedule_type || "schedule",
        time: normalizeTime(defaultPayload.time),
        date: parseDateForInput(defaultPayload.date),
        reocurrence: defaultPayload.reocurrence || [],
        clients: selectedClients || defaultPayload.clients || [],
        actionType: Boolean(defaultPayload?._id) ? "UPDATE" : undefined,
        id: Boolean(defaultPayload?._id) ? defaultPayload._id : undefined,
        possibleStatus:
          Array.isArray(defaultPayload?.notificationStatus?.possibleStatus)
          ? defaultPayload.notificationStatus.possibleStatus.map(item => {
          if (typeof item === "string") {
          return { name: item, imageRequired: false };
          }
          return {
          name: item.name,
          imageRequired: Boolean(item.imageRequired)
          };
        }): [],

        // Preserve the entire clientMarkedStatus array when editing
        defaultStatus: defaultPayload?.notificationStatus?.clientMarkedStatus || [],
        // Store original clientMarkedStatus for image preservation
        originalClientMarkedStatus: defaultPayload?.notificationStatus?.clientMarkedStatus || []

    })
    function getNormalizedPayloadForSave(payload) {
        return {
            ...payload,
           possibleStatus: payload.possibleStatus.map(s => ({
            name: s.name,
            imageRequired: Boolean(s.imageRequired)})),

            clientMarkedStatus: typeof payload.defaultStatus === "string"
                ? { status: payload.defaultStatus, markedAt: null }
                : payload.clientMarkedStatus
        };
    }
  const clientId = selectedClients?.[0];
  const isClientNudgesContext = !!clientId;
  const context = isClientNudgesContext ? 'client_nudges' : 'notifications';

  const closeRef = useRef()

  const cachedHistory = clientId
    ? getCachedNotificationsForClientByContext(clientId, context)
    : getCachedNotificationsByContext(context);
  const { data: apiHistoryData } = useSWR(
    clientId ? `client/nudges/history/${clientId}` : null,
    () => retrieveClientNudges(clientId, { limit: 50 })
  );

  const apiHistoryNudges = apiHistoryData?.data?.results || [];
  const allHistoryNudges = [...cachedHistory, ...apiHistoryNudges];

  const uniqueHistoryNudges = allHistoryNudges
    .filter((nudge, index, self) =>
      index === self.findIndex(n =>
        n.subject === nudge.subject && n.message === nudge.message
      )
    )
    .sort((a, b) => {
      const timeA = a.createdAt || a.createdDate || 0;
      const timeB = b.createdAt || b.createdDate || 0;
      return timeB - timeA;
    });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        subjectRef.current && !subjectRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHistorySelect = (nudge) => {
    setPayload(prev => ({
      ...prev,
      subject: nudge.subject || "",
      message: nudge.message || "",
      notificationType: nudge.schedule_type || nudge.notificationType || "schedule",
      time: convertTimeTo12Hour(nudge.time || ""),
      date: nudge.date ? formatDate(nudge.date) : "",
      reocurrence: nudge.reocurrence || [],
      clients: nudge.clients || []
    }));
    setShowHistory(false);
  };

  async function scheduleNotification() {
    const toastId = toast.loading("Please wait...")
    try {
      setLoading(true);
      const formData = generatePayload(
        getNormalizedPayloadForSave(payload),
        defaultPayload._id,
      );
      const response = await sendData(
        `app/notifications-schedule`,
        formData,
        defaultPayload._id ? "PUT" : "POST"
      );

      if (response.status_code === 200 && !response.errors?.length) {
        toast.success(response.message)
        closeRef.current.click()
        mutate(`client/nudges/${currentClientId}`)
        return
      }

      if (response.status_code !== 200) {
        _throwError(response.message)
      }

      if (response.errors && response.errors.length) {
        for (const error of response.errors) {
          toast.error(error || "Something went wrong")
        }
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
      toast.dismiss(toastId);
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }

  return <Dialog>
    <DialogTrigger asChild>
      <span>
        {!children && <Button className="font-bold">Schedule</Button>}
        {children}
      </span>
    </DialogTrigger>
    <DialogContent
      onInteractOutside={(event) => {
        const originalEvent = event.detail?.originalEvent;
        const target = originalEvent?.target;

        if (
          target &&
          typeof target.closest === "function" &&
          (target.closest("[data-slot='popover-content']") ||
            target.closest("[data-slot='popover-trigger']"))
        ) {
          // Allow interacting with the time picker popover without closing this dialog
          event.preventDefault();
        }
      }}
      className="!max-w-[500px] max-h-[65vh] border-0 p-0 gap-0 overflow-auto"
    >
      <DialogClose ref={closeRef} />
      <DialogTitle className="bg-[var(--comp-2)] py-6 h-[56px] border-b-1 text-black text-[20px] p-4">
        {defaultPayload.id ? "Update Client Nudges" : "Add Client Nudges"}
      </DialogTitle>
      <DialogDescription className="sr-only">
        {defaultPayload.id ? "Update notification settings for your client" : "Create a new notification for your client"}
      </DialogDescription>
      <div className="px-4 pb-8">
        <div className="relative mb-4" ref={subjectRef}>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[14px]">
              Subject
              {uniqueHistoryNudges.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({uniqueHistoryNudges.length} history available)
                </span>
              )}
            </Label>
            {uniqueHistoryNudges.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-gray-600 hover:text-gray-900"
                onClick={() => setShowHistory(prev => !prev)}
              >
                <History className="w-3.5 h-3.5" />
                History
              </Button>
            )}
          </div>
          <input
            type="text"
            placeholder="Subject"
            value={payload.subject}
            onChange={e => setPayload(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--comp-1)]"
          />
          {showHistory && uniqueHistoryNudges.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto"
            >
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Notification History
                </div>
                <div className="text-xs text-gray-500">
                  {uniqueHistoryNudges.length} {uniqueHistoryNudges.length === 1 ? 'item' : 'items'} available
                </div>
              </div>
              {uniqueHistoryNudges.map((nudge, index) => (
                <div
                  key={index}
                  onClick={() => handleHistorySelect(nudge)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 last:rounded-b-lg transition-colors duration-150"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm text-gray-900 flex-1 truncate">
                      {nudge.subject}
                    </div>
                    <div className="flex items-center gap-1">
                      {nudge.schedule_type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {nudge.schedule_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {nudge.message}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {nudge.time && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{nudge.time.substring(0, 5)}</span>
                        </div>
                      )}
                      {nudge.date && nudge.schedule_type === "schedule" && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{nudge.date}</span>
                        </div>
                      )}
                    </div>

                    {(nudge.clientNames && nudge.clientNames.length > 0) && (
                      <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                        {nudge.clientNames.length} client{nudge.clientNames.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {nudge.clientNames && nudge.clientNames.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium">Clients:</span> {nudge.clientNames.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <Label className="text-[14px] mb-2 block">Message</Label>
          <Textarea
            placeholder="Message"
            value={payload.message}
            onChange={e => setPayload(prev => ({ ...prev, message: e.target.value }))}
            className="h-[120px] bg-[var(--comp-1)]"
          />
        </div>
        <div className="mb-4">
          <Label className="text-[14px] mb-2 block">Notification Type</Label>
          <RadioGroup className="flex flex-wrap items-center gap-x-6">
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="notification-type-schedule"
                onChange={() => setPayload(prev => ({ ...prev, notificationType: "schedule" }))}
                checked={payload.notificationType === "schedule"}
              />
              <Label htmlFor="notification-type-schedule">Schedule</Label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                id="notification-type-reocurr"
                onChange={() => setPayload(prev => ({ ...prev, notificationType: "reocurr" }))}
                checked={payload.notificationType === "reocurr"}
              />
              <Label htmlFor="notification-type-reocurr">Reocurr</Label>
            </div>
          </RadioGroup>
        </div>

        {(!selectedClients || selectedClients?.length <= 0) && (
          <div className="mb-4">
            <SelectMultiple
              label="Select Clients"
              options={clients}
              value={payload.clients}
              onChange={value => setPayload(prev => ({ ...prev, clients: value }))}
              className="[&_.option]:px-4 [&_.option]:py-2"
              selectAll={true}
            />
          </div>
        )}
        <div className="mb-4">
          <Label className="text-[14px] mb-2 block">Time</Label>
          <TimePicker
            selectedTime={typeof payload.time === 'string' ? payload.time : (payload.time instanceof Date ? format(payload.time, "hh:mm a") : "")}
            setSelectedTime={value => setPayload(prev => ({ ...prev, time: typeof value === 'string' ? value : "" }))}
          />
        </div>

        {payload.notificationType === "schedule" && (
          <div className="mb-4">
            <FormControl
              label="Date"
              value={payload.date || ""}
              onChange={e => {
                const selectedDate = e.target.value;
                // Validate that date is in the future
                if (selectedDate) {
                  const parsedDate = parse(selectedDate, "yyyy-MM-dd", new Date());
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (parsedDate < today) {
                    toast.error("Scheduled time must be in the future");
                    return;
                  }
                }
                setPayload(prev => ({ ...prev, date: selectedDate }));
              }}
              type="date"
              min={format(new Date(), "yyyy-MM-dd")}
              className="[&_.input]:bg-[var(--comp-1)]"
            />
          </div>
        )}
        {payload.notificationType === "reocurr" && (
          <NotificationRepeat
            formData={{ reocurrence: payload.reocurrence }}
            dispatch={setPayload}
          />
        )}
        <NotificationStatuses
          payload={payload}
          setPayload={setPayload}
        />
        {/* <div className="mb-4">
          <Label className="font-bold text-[14px] mb-2 block">Image Requirement</Label>
          <p className="text-xs text-gray-500 mb-3">
            Require clients to upload an image when responding to this notification
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={payload.isImageRequired || false}
              onCheckedChange={(checked) => {
                setPayload(prev => ({ ...prev, isImageRequired: checked || false }))
              }}
            />
            <span className="text-sm text-gray-700">Require image upload</span>
          </label>
        </div> */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={scheduleNotification}
            disabled={loading}
            variant="wz"
          >
            {defaultPayload._id ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
}

function generatePayload(payload, id) {
  const isUpdate = Boolean(id)
  for (const field of ["subject", "message", "time"]) {
    if (!payload[field]) throw new Error(`${field} is mandatory.`);
  }

  if (payload.notificationType === "reocurr") {
    const result = {
      subject: payload.subject,
      message: payload.message,
      notificationType: "reocurr",
      schedule_type: "reocurr",
      time: formatTime(payload.time),
      reocurrence: payload.reocurrence,
      clients: Array.isArray(payload.clients)
        ? payload.clients[0]
        : payload.clients,
      isImageRequired: payload.isImageRequired || false
    };
    result.notificationStatus = {
    possibleStatus: (payload.possibleStatus || []).map(status => {
      if (typeof status === "string") {
        return { name: status.trim(), imageRequired: false };
      }
      return status;
    }),

    // Preserve existing clientMarkedStatus with images when updating
    clientMarkedStatus: (() => {
      if (isUpdate && Array.isArray(payload.originalClientMarkedStatus) && payload.originalClientMarkedStatus.length > 0) {
        // When updating, preserve existing clientMarkedStatus entries with their images
        return payload.originalClientMarkedStatus.map(entry => ({
          ...entry,
          date: entry.date ? (entry.date.includes(' ') ? entry.date.split(' ')[0] : entry.date) : format(new Date(), "dd-MM-yyyy")
        }));
      } else if (Array.isArray(payload.defaultStatus) && payload.defaultStatus.length > 0) {
        return payload.defaultStatus.map(entry => ({
          ...entry,
          date: entry.date ? (entry.date.includes(' ') ? entry.date.split(' ')[0] : entry.date) : format(new Date(), "dd-MM-yyyy")
        }));
      } else if (typeof payload.defaultStatus === "string") {
        return [{
          status: payload.defaultStatus.trim(),
          imageLink: null,
          date: format(new Date(), "dd-MM-yyyy")
        }];
      }
      return payload.defaultStatus || [];
    })()
  };

    if (payload.actionType) result.actionType = payload.actionType;
    if (payload.id) result.id = payload.id;

    return result;
  } else if (payload.notificationType === "schedule") {
    if (!payload.date) throw new Error(`date is mandatory.`);

    try {
      // Parse date string (always in yyyy-MM-dd format from input)
      const parsedDate = parse(payload.date, "yyyy-MM-dd", new Date());
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      // Validate that the date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(parsedDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error("Scheduled time must be in the future");
      }

      // Also validate date + time combination is in the future
      const timeStr = formatTime(payload.time);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const scheduledDateTime = new Date(parsedDate);
      scheduledDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      
      if (scheduledDateTime < new Date()) {
        throw new Error("Time should be in the future");
      }

      const result = {
        subject: payload.subject,
        message: payload.message,
        notificationType: "schedule",
        schedule_type: "schedule",
        date: format(parsedDate, "dd-MM-yyyy"),
        time: formatTime(payload.time),
        clients: Array.isArray(payload.clients)
          ? payload.clients[0]
          : payload.clients,
        isImageRequired: payload.isImageRequired || false
      };

      // Only add actionType and id if they have values
      if (payload.actionType) result.actionType = payload.actionType;
      if (payload.id) result.id = payload.id;

      if (isUpdate) {
        result.actionType = "UPDATE"
        result.id = id
      }

      // Preserve existing clientMarkedStatus with images when updating
      let clientMarkedStatus = [];
      if (isUpdate && Array.isArray(payload.originalClientMarkedStatus) && payload.originalClientMarkedStatus.length > 0) {
        // When updating, preserve existing clientMarkedStatus entries with their images
        clientMarkedStatus = payload.originalClientMarkedStatus.map(entry => ({
          ...entry,
          date: entry.date ? (entry.date.includes(' ') ? entry.date.split(' ')[0] : entry.date) : format(new Date(), "dd-MM-yyyy")
        }));
      } else if (Array.isArray(payload.defaultStatus) && payload.defaultStatus.length > 0) {
        // Use provided defaultStatus array
        clientMarkedStatus = payload.defaultStatus.map(entry => ({
          ...entry,
          date: entry.date ? (entry.date.includes(' ') ? entry.date.split(' ')[0] : entry.date) : format(new Date(), "dd-MM-yyyy")
        }));
      } else if (typeof payload.defaultStatus === "string" && payload.defaultStatus.trim()) {
        // Fallback to string defaultStatus
        clientMarkedStatus = [{
          status: payload.defaultStatus.trim(),
          imageLink: null,
          date: format(new Date(), "dd-MM-yyyy")
        }];
      } else {
        // Empty fallback
        clientMarkedStatus = [];
      }

      result.notificationStatus = {
        possibleStatus: (payload.possibleStatus || []).map(status => {
                    if (typeof status === "string") return { name: status.trim(), imageRequired: false };
                    return status;
                }),
        clientMarkedStatus: clientMarkedStatus
      };

      return result;
    } catch (error) {
      // Preserve the original error message if it's about future time
      if (error.message && error.message.includes("future")) {
        throw error;
      }
      throw new Error(`Invalid date format: ${payload.date}`);
    }
  }
  throw new Error("Type of notification is mandatory.")
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function NotificationRepeat({
  formData: { reocurrence = [] },
  dispatch
}) {
  return <div className="mb-4">
    <div className="mb-2 text-[14px]">Repeat</div>
    <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar">
      {days.map((day, index) => <Badge
        variant="wz_fill"
        className={`rounded-full border-0 font-bold cursor-pointer ${!reocurrence.includes(index) && "text-[var(--dark-1)]/25 bg-[var(--comp-1)] opacity-50"}`}
        key={index}
        onClick={reocurrence.includes(index)
          ? () => dispatch(prev => ({ ...prev, reocurrence: reocurrence.filter(item => item !== index) }))
          : () => dispatch(prev => ({ ...prev, reocurrence: [...reocurrence, index] }))
        }>
        <span>{day}</span>
        {reocurrence.includes(index)
          ? <CircleMinus className="w-[12px] h-[12px]" />
          : <CirclePlus className="w-[12px] h-[12px]" />}
      </Badge>)}
    </div>
  </div>
}

function NotificationStatuses({ payload, setPayload }) {
  const [newStatus, setNewStatus] = useState("");
  
  const handleAddStatus = (e) => {
    try {
      // Prevent any default behavior
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const trimmedStatus = newStatus.trim();
      if (!trimmedStatus) {
        toast.error("Please enter a status name");
        return;
      }
      
      // Ensure possibleStatus is an array
      const currentStatuses = Array.isArray(payload.possibleStatus) 
        ? payload.possibleStatus 
        : [];
      
      // Check if status already exists
      if (currentStatuses.includes(trimmedStatus)) {
        toast.error("This status already exists");
        setNewStatus("");
        return;
      }
      
      // Safely update the payload
      setPayload(prev => {
        const prevStatuses = Array.isArray(prev.possibleStatus) 
          ? prev.possibleStatus 
          : [];
        
        return {
          ...prev,
          possibleStatus: [
            ...prevStatuses,
            { name: trimmedStatus, imageRequired: false }
          ]
        };
      });
      
      setNewStatus("");
    } catch (error) {
      console.error("Error adding status:", error);
      toast.error("Failed to add status. Please try again.");
    }
  };

  const handleRemoveStatus = (statusToRemove) => {
    try {
      setPayload(prev => {
        const prevStatuses = Array.isArray(prev.possibleStatus) 
          ? prev.possibleStatus 
          : [];
        
        const updatedStatuses = prevStatuses.filter(item => item !== statusToRemove);
        // If the removed status was the default, clear the default status
        const updatedDefaultStatus = prev.defaultStatus === statusToRemove ? "" : prev.defaultStatus;
        
        return {
          ...prev,
          possibleStatus: updatedStatuses,
          defaultStatus: updatedDefaultStatus
        };
      });
    } catch (error) {
      console.error("Error removing status:", error);
      toast.error("Failed to remove status. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAddStatus(e);
    }
  };

  const possibleStatuses = Array.isArray(payload.possibleStatus) 
    ? payload.possibleStatus 
    : [];
  useEffect(() => {
    setPayload(prev => {
      const prevStatuses = Array.isArray(prev.possibleStatus)
      ? prev.possibleStatus
      : [];

      const defaults = [
      { name: "In Progress", imageRequired: false },
      { name: "Done", imageRequired: false },
      ];
      const missing = defaults.filter(def =>
      !prevStatuses.some(s => s.name === def.name)
      );

      const updatedStatuses = [...prevStatuses, ...missing];
      const shouldSetDefault =
      !prev.defaultStatus ||
      !updatedStatuses.some(s => s.name === prev.defaultStatus);

      return {
      ...prev,
      possibleStatus: updatedStatuses,
      defaultStatus: shouldSetDefault
        ? updatedStatuses[0].name
        : prev.defaultStatus,
      };
    });
    }, []);

  return <div className="mb-4">
    <Label className="font-bold text-[14px] mb-2 block">Possible Status</Label>
    <p className="text-xs text-gray-500 mb-3">
      Add status options that clients can choose from when responding to this notification
    </p>
    <div 
      className="flex gap-2 items-center"
      onKeyDown={(e) => {
        // Prevent form submission if this is inside a form
        if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
          e.preventDefault();
        }
      }}
    >
      <Input
        type="text"
        value={newStatus}
        onChange={e => setNewStatus(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter status (e.g., Completed, Pending)"
        className="bg-[var(--comp-1)] rounded-[4px] flex-1"
        autoComplete="off"
      />
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddStatus(e);
        }}
        variant="outline"
        size="icon"
        className="shrink-0"
        disabled={!newStatus.trim()}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
    
    {possibleStatuses.length > 0 && (
      <div className="mt-3 p-3 bg-[var(--comp-1)] border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 flex-wrap">
        {possibleStatuses.map((status, index) => (
          <div
            key={index}
            className="w-full flex items-center justify-between border p-2 rounded-lg bg-white"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{status.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveStatus(status)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Image Required</span>
        <Checkbox
        checked={status.imageRequired}
        onCheckedChange={(checked) => {
          setPayload(prev => {
            const updated = prev.possibleStatus.map(s =>
              s.name === status.name
                ? { ...s, imageRequired: !!checked }
                : s
            );
            return { ...prev, possibleStatus: updated };
          });
                }} />
            </div>
          </div>))}

        </div>
      </div>
    )}

    {possibleStatuses.length > 0 && (
      <>
        <Label className="font-bold text-[14px] mt-4 mb-2 block">Default Status</Label>
        <p className="text-xs text-gray-500 mb-2">
          Select the default status that will be pre-selected for clients
        </p>
        <Select
          value={payload.defaultStatus || undefined}
          onValueChange={value => {
            // Handle clearing the selection - if value is empty, set to empty string
            setPayload(prev => ({ ...prev, defaultStatus: value || "" }))
          }}
        >
          <SelectTrigger className="bg-[var(--comp-1)] w-full">
            <SelectValue placeholder="Select default status" />
          </SelectTrigger>
          <SelectContent>
            {possibleStatuses.map((status, index) => (
              <SelectItem value={status.name} key={index}>{status.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )}
  </div>
}
