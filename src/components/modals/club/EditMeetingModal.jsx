import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import TimePicker from "@/components/common/TimePicker";
import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import SelectMultiple from "@/components/SelectMultiple";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { selectMeetingEditFields } from "@/config/data/forms";
import { sendData, uploadImage } from "@/lib/api";
import { getMeetingClientList } from "@/lib/fetchers/club";
import { _throwError, setDateWithNewTime } from "@/lib/formatter";
import { getObjectUrl } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { format, parseISO } from "date-fns";
import { CircleMinus, CirclePlus, Pen } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { UpdateAllowedRollnos } from "./LinkGenerator";

export default function EditMeetingModal({ meeting }) {
  const [loading, setLoading] = useState(false);
  const closeBtnRef = useRef(null);
  const [formData, setFormData] = useState(generatePayload(meeting))

  async function editMeeting(e) {
    try {
      e.preventDefault();
      setLoading(true);
      if (formData.banner) {
        const thumbnail = await uploadImage(formData.banner);
        formData.banner = thumbnail.img;
      }
      const data = {}
      for (const field in formData) {
        if (formData[field]) data[field] = formData[field];
      }

      if (formData.date && formData.time) data.scheduleDate = setDateWithNewTime(
        new Date(formData.date),
        formData.time
      )

      const response = await sendData(`edit-meetingLink?meetingId=${meeting._id}`, data, "PUT");
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate("getMeetings");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  const fieldsToBeDisplayed = selectMeetingEditFields(meeting.meetingType);

  return <Dialog>
    <DialogTrigger>
      <Pen className="w-[16px]" />
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] max-h-[65vh] border-0 p-0 overflow-auto">
      <DialogHeader className="bg-[var(--comp-2)] py-6 h-[56px] border-b-1">
        <DialogTitle className="text-black text-[20px] ml-5">
          Update Meeting Details
        </DialogTitle>
      </DialogHeader>
      <form className="px-4 pb-8" onSubmit={editMeeting}>
        {fieldsToBeDisplayed.map(field =>
          <SelectMeetingFormField
            key={field.id}
            className="focus:shadow-none [&_.input]:bg-[var(--comp-1)] [&_.input]:mb-4"
            field={field}
            formData={formData}
            dispatch={setFormData}
          />
        )}
        <DialogClose ref={closeBtnRef} className="mt-4 mr-2 py-[8px] px-4 rounded-[8px] border-2">Cancel</DialogClose>
        <Button variant="wz" disabled={loading}>Update</Button>
      </form>
    </DialogContent>
  </Dialog>
}

function SelectMeetingFormField({ field, formData, dispatch }) {
  const { client_categories } = useAppSelector(state => state.coach.data)
  if (field.inputtype === 1) return <FormControl
    key={field.id}
    className="text-[14px] [&_.label]:font-[400] block mb-4"
    type={field.type || "text"}
    value={formData[field.name]}
    onChange={e => dispatch(prev => ({ ...prev, [field.name]: e.target.value }))}
    label={field.label}
    placeholder={field.placeholder}
  />
  else if (field.inputtype === 2) return <MeetingType
    key={field.id}
    field={field}
  />
  else if (field.inputtype === 3) return <MeetingDescription
    key={field.id}
    field={field}
    formData={formData}
    dispatch={dispatch}
  />
  else if (field.inputtype === 4) return <MeetingRepeat
    key={field.id}
    formData={formData}
    dispatch={dispatch}
  />
  else if (field.inputtype === 5) return <MeetingBanner
    key={field.id}
    field={field}
    formData={formData}
    dispatch={dispatch}
  />
  else if (field.inputtype === 6) return <SelectMultiple
    key={field.id}
    className="[&_.option]:px-4 [&_.option]:py-2 mb-4"
    label={field.label}
    options={[
      ...field.options,
      ...(client_categories.map((category, index) => ({ id: index + 3, name: category.name, value: category.name })))
    ]}
    value={formData.allowed_client_type}
    onChange={(newValues) => dispatch(prev => ({ ...prev, "allowed_client_type": newValues }))}
  />
  else if (field.inputtype === 7) return <SelectOneToOneClient
    key={field.id}
    field={field}
  />
  else if (field.inputtype === 8) return <div>
    <label className="text-[14px]">{field.label}</label>
    <TimePicker
      selectedTime={formData.time}
      setSelectedTime={value => dispatch(prev => ({ ...prev, "time": value }))}
    />
  </div>
  else if (field.inputtype === 9) return <UpdateAllowedRollnos
    field={field}
    formData={formData}
    onChange={(value) => dispatch(prev => ({ ...prev, "allowed_client_rollnos": value }))}
  />;
}


function generatePayload(meeting) {
  return {
    topics: meeting?.topics || "",
    baseLink: meeting?.baseLink || "",
    date: meeting?.scheduleDate
      ? format(parseISO(meeting.scheduleDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    time: meeting?.scheduleDate
      ? format(parseISO(meeting.scheduleDate), "hh:mm a")
      : format(new Date(), "hh:mm a"),
    reOcurred: meeting?.reOcurred || false,
    description: meeting?.description || "",
    duration: meeting?.duration || "",
    eventVolumePointAmount: meeting?.eventVolumePointAmount || "",
    banner: meeting?.banner || "/",
    allowed_client_type: meeting?.allowed_client_type || "",
    one_to_one_client_id: meeting?.one_to_one_client_id || "",
    allowed_client_rollnos: meeting?.allowed_client_rollnos || []
  };
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MeetingRepeat({
  formData: { reOcurred = [] },
  dispatch
}) {
  return <div className="mb-4">
    <div className="mb-2">Repeat</div>
    <div className="w-[418px] flex items-center gap-2 overflow-x-auto no-scrollbar">
      {days.map((day, index) => <Badge
        variant="wz_fill"
        className={`rounded-full border-0 font-bold cursor-pointer ${!reOcurred.includes(index) && "text-[var(--dark-1)]/25 bg-[var(--comp-1)] opacity-50"}`}
        key={index}
        onClick={reOcurred.includes(index)
          ? () => dispatch(prev => ({ ...prev, reOcurred: reOcurred.filter(item => item !== index) }))
          : () => dispatch(prev => ({ ...prev, reOcurred: [...reOcurred, index] }))
        }>
        <span>{day}</span>
        {reOcurred.includes(index)
          ? <CircleMinus className="w-[12px] h-[12px]" />
          : <CirclePlus className="w-[12px] h-[12px]" />}
      </Badge>)}
    </div>
  </div >
}

export function MeetingDescription({ field, formData, dispatch }) {
  return <div className="my-4">
    <Label className="mb-2">Meeting Description</Label>
    <Textarea
      placeholder={field.placeholder}
      value={formData[field.name]}
      onChange={e => dispatch(prev => ({ ...prev, description: e.target.value }))}
      className="h-[120px]"
    />
  </div>
}

export function SelectOneToOneClient({
  field: { one_to_one_client_id },
  dispatch
}) {
  const { isLoading, error, data } = useSWR("app/meeting/client-list", getMeetingClientList);

  if (isLoading) return <div className="mb-4 flex justify-center">
    <Loader />
  </div>

  if (error || data?.status_code !== 200) return <ContentError
    className="min-h-auto mb-4"
    title={error || data?.message}
  />
  const clients = data.data;
  const options = clients.map((client, index) => ({
    name: client.name,
    value: client._id,
    id: index
  }))
  return <SelectControl
    label="Select A Client For One to One"
    value={one_to_one_client_id}
    onChange={e => dispatch(prev => ({ ...prev, "one_to_one_client_id": e.target.value }))}
    options={options}
    className="block mb-4"
  />
}

export function MeetingBanner({
  dispatch,
  formData,
  field,
}) {
  const fileRef = useRef();
  return <div className="mb-4">
    <label className="text-[14px]" htmlFor="meeting-banner">{field.label}</label>
    <Image
      src={formData.banner && formData.banner instanceof File ? getObjectUrl(formData.banner) : formData.banner || "/not-found.png"}
      height={540}
      width={540}
      alt=""
      className="w-full bg-[var(--comp-1)] mt-2 aspect-video object-contain rounded-md border-1"
      onClick={() => fileRef.current.click()}
      onError={e => e.target.src = "/not-found.png"}
      unoptimized
    />
    <input
      ref={fileRef}
      id="meeting-banner"
      type="file"
      hidden
      onChange={e => dispatch(prev => ({ ...prev, [field.name]: e.target.files[0] }))}
      accept="image/*"
    />
  </div>
}