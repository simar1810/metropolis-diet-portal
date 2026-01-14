import FormControl from "@/components/FormControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  changeFieldvalue,
  generateRequestPayload,
  init,
  linkGeneratorReducer,
  resetCurrentState,
  selectFields,
  setCurrentView,
  setWellnessZLink
} from "@/config/state-reducers/link-generator";
import { sendDataWithFormData } from "@/lib/api";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import { CircleMinus, CirclePlus, Copy, Minus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ZoomConnectNowModal from "./ZoomConnectNowModal";
import { copyText, getObjectUrl } from "@/lib/utils";
import useSWR, { mutate, useSWRConfig } from "swr";
import Image from "next/image";
import { getMeetingClientList } from "@/lib/fetchers/club";
import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import SelectControl from "@/components/Select";
import imageCompression from "browser-image-compression";
import SelectMultiple from "@/components/SelectMultiple";
import TimePicker from "@/components/common/TimePicker";
import { _throwError, ensureHttps, validLink } from "@/lib/formatter";

export default function LinkGenerator({ withZoom, children }) {
  const zoom_doc_id = useAppSelector(state => state.coach.data.zoom_doc_id);
  if (withZoom && !zoom_doc_id) return <ZoomConnectNowModal />

  return <Dialog>
    {children}
    <CurrentStateProvider
      state={init(withZoom)}
      reducer={linkGeneratorReducer}
    >
      <DialogContent className="!max-w-[450px] max-h-[70vh] text-center p-0 border-0 overflow-auto gap-0">
        <MeetingGeneratorContainer withZoom={withZoom} />
      </DialogContent>
    </CurrentStateProvider>
  </Dialog>
}

function MeetingGeneratorContainer({ withZoom }) {
  const { view } = useCurrentStateContext();
  if (view === 1) return <MeetingForm withZoom={withZoom} />
  if (view === 5) return <MeetingSuccess />
  if ([2, 3].includes(view)) return <MeetingLink />
}

function MeetingSuccess() {
  const { wellnessZLink, dispatch } = useCurrentStateContext();
  return <div className="p-4">
    <DialogHeader className="mb-4 pb-4 border-b-1">
      <DialogTitle className="px-4">Meeting Success</DialogTitle>
    </DialogHeader>
    <div className="mt-10 mb-32">
      <Label className="font-bold mb-2" htmlFor="wz-link">Metro Polis Link</Label>
      <div className="bg-[var(--accent-1)] flex items-center border-1 rounded-[8px] overflo-clip">
        <div id="wz-link" placeholder="Metro Polis Link" className="bg-[var(--primary-1)]  text-[14px] p-2 rounded-r-none border-0">
          {wellnessZLink}
        </div>
        <div
          onClick={() => {
            copyText(wellnessZLink)
            toast.success("Link Copied!");
          }}
          className="text-white aspect-square rounded-r-[8px] p-[10px] cursor-pointer"
        >
          <Copy />
        </div>
      </div>
      <Button variant="wz" className="block mt-4 mx-auto" onClick={() => dispatch(resetCurrentState())}>New Meeting</Button>
    </div>
  </div>
}

function MeetingLink() {
  const { baseLink, view, wellnessZLink, copyToClipboard, dispatch } = useCurrentStateContext();

  return <>
    <DialogHeader className="mb-4 border-b-1">
      <DialogTitle className="p-4">Meeting Link</DialogTitle>
    </DialogHeader>
    <div className="text-left p-4">
      <p className="text-[14px] leading-[1.6] text-left">Say goodbye to loong, complicated links and Say hello to custom integerated meeting links </p>
      <FormControl
        label="Meeting Link"
        value={baseLink}
        onChange={e => dispatch(changeFieldvalue("baseLink", ensureHttps(e.target.value)))}
        placeholder="Type or paste your link here"
        className="block mt-4"
      />
      {view !== 3 && <>
        <Button
          variant="wz"
          className="block mt-4 mx-auto"
          onClick={() => {
            dispatch(setCurrentView(1))
          }}
        >
          Convert
        </Button>
        <div className="mt-4 flex justify-center gap-2">
          <Switch
            id="meeting-link-switch"
            checked={copyToClipboard}
            onClick={() => dispatch(changeFieldvalue("copyToClipboard", !copyToClipboard))}
          />
          <Label htmlFor="meeting-link-switch">Auto Paste from Clipboard </Label>
        </div>
      </>}
      {view === 3 && <div className="mt-10 mb-32">
        <Label className="font-bold mb-2" htmlFor="wz-link">Link</Label>
        <div className="bg-[var(--accent-1)] flex items-center border-1 rounded-[8px] overflo-clip">
          <div id="wz-link" placeholder="Metro Polis Link" className="bg-[var(--primary-1)]  text-[14px] p-2 rounded-r-none border-0">
            {wellnessZLink}
          </div>
          <div
            onClick={() => {
              copyText(wellnessZLink)
              toast.success("Link Copied!");
            }}
            className="text-white aspect-square rounded-r-[8px] p-[10px] cursor-pointer"
          >
            <Copy />
          </div>
        </div>
        <Button variant="wz" className="block mt-4 mx-auto" onClick={() => dispatch(resetCurrentState())}>New Meeting</Button>
      </div>}
    </div>
  </>
}

async function generateMeeting(withZoom, data, baseLink) {
  if (withZoom) {
    const response = await sendDataWithFormData(`zoom/meeting/schedule?club=${process.env.NEXT_PUBLIC_ZOOM_CLUB_ID}`, data);
    return response;
  } else {
    data.append("baseLink", baseLink);
    const response = await sendDataWithFormData(`generateCustomLink?club=${process.env.NEXT_PUBLIC_ZOOM_CLUB_ID}`, data);
    return response;
  }
}

function MeetingForm({ withZoom }) {
  const { cache } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const closeBtnRef = useRef();

  const { dispatch, ...state } = useCurrentStateContext();
  const fieldsToBeDisplayed = selectFields(state.meetingType);

  async function createMeeting() {
    try {
      setLoading(true);
      if (state.banner) state.banner = await imageCompression(state.banner, { maxSizeMB: 0.25 })
      const data = generateRequestPayload(state);
      const response = await generateMeeting(withZoom, data, state.baseLink);
      if (!response.status && !response.success) throw new Error(response.message || response.error);
      toast.success(response.message || "Meeting created successfully!");
      dispatch(setWellnessZLink(response?.data?.wellnessZLink || response?.data?.newMeeting?.wellnessZLink));
      cache.delete('getMeetings');
      if (state.copyToClipboard) {
        copyText(response?.data?.wellnessZLink);
        toast.success("Link copied");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <DialogHeader className="mb-4 border-b-1">
      <DialogTitle className="p-4">Meeting Details</DialogTitle>
    </DialogHeader>
    <div className="text-left px-4">
      {fieldsToBeDisplayed.map(field => <SelectMeetingFormField
        key={field.id}
        field={field}
        formData={state}
        dispatch={dispatch}
      />)}
      <DialogClose ref={closeBtnRef} />
    </div>
    <div className="flex gap-4 p-4 sticky bottom-0 bg-white border-t-1">
      <Button onClick={() => dispatch(changeFieldvalue("view", 2))} className="grow">Previous</Button>
      <Button
        onClick={createMeeting}
        variant="wz"
        className="grow block mx-auto"
        disabled={loading}
      >
        Create Meeting
      </Button>
    </div>
  </>
}

export function MeetingType({ field }) {
  const { dispatch, ...state } = useCurrentStateContext();
  return <div className="mb-6">
    <div className="mb-2">Meeting Type</div>
    <div>
      <RadioGroup className="flex flex-wrap items-center gap-x-6">
        {field.options.map((radio, index) =>
          <div key={radio.id} className="flex items-center gap-1">
            <input
              type="radio"
              id={"meeting-type-" + radio.value}
              onChange={() => dispatch(changeFieldvalue(field.name, radio.value))}
              checked={state.meetingType === radio.value}
            />
            <Label htmlFor={"meeting-type-" + radio.value}>{radio.title}</Label>
          </div>)}
      </RadioGroup>
    </div>
  </div>
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MeetingRepeat({ field }) {
  const { reOcurred, dispatch } = useCurrentStateContext();
  return <div className="mb-4">
    <div className="mb-2">Repeat</div>
    <div className="w-[418px] flex items-center gap-2 overflow-x-auto no-scrollbar">
      {days.map((day, index) => <Badge
        variant="wz_fill"
        className={`rounded-full border-0 font-bold cursor-pointer ${!reOcurred.includes(index) && "text-[var(--dark-1)]/25 bg-[var(--comp-1)] opacity-50"}`}
        key={index}
        onClick={reOcurred.includes(index)
          ? () => dispatch(changeFieldvalue(field.name, reOcurred.filter(item => item !== index)))
          : () => dispatch(changeFieldvalue(field.name, [...reOcurred, index]))}
      >
        <span>{day}</span>
        {reOcurred.includes(index)
          ? <CircleMinus className="w-[12px] h-[12px]" />
          : <CirclePlus className="w-[12px] h-[12px]" />}
      </Badge>)}
    </div>
  </div>
}

export function MeetingDescription({ field }) {
  const { dispatch, ...state } = useCurrentStateContext();
  return <div className="mb-4">
    <Label className="mb-2">Meeting Description</Label>
    <Textarea
      {...field}
      value={state[field.name]}
      onChange={e => dispatch(changeFieldvalue(field.name, e.target.value))}
      className="h-[120px]"
    />
  </div>
}

export function MeetingBanner({ field }) {
  const { dispatch, ...state } = useCurrentStateContext();
  const fileRef = useRef();

  return <div className="mb-4">
    <label className="text-[14px]" htmlFor="meeting-banner">{field.label}</label>
    <Image
      src={state.banner ? getObjectUrl(state.banner) : "/not-found.png"}
      height={540}
      width={540}
      alt=""
      className="w-full bg-[var(--comp-1)] mt-2 aspect-video object-contain rounded-md border-1"
      onClick={() => fileRef.current.click()}
      unoptimized
    />
    <input
      ref={fileRef}
      id="meeting-banner"
      type="file"
      hidden
      onChange={e => dispatch(changeFieldvalue(field.name, e.target.files[0]))}
      accept="image/*"
    />
  </div>
}

export function SelectOneToOneClient({ field }) {
  const { isLoading, error, data } = useSWR("app/meeting/client-list", getMeetingClientList);

  const { one_to_one_client_doc, dispatch } = useCurrentStateContext();

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
    value={one_to_one_client_doc}
    onChange={e => dispatch(changeFieldvalue("one_to_one_client_id", e.target.value))}
    options={options}
    className="block mb-4"
  />
}

function SelectMeetingFormField({ field, formData, dispatch }) {
  const { client_categories } = useAppSelector(state => state.coach.data)
  if (field.inputtype === 1) return <FormControl
    key={field.id}
    className="text-[14px] [&_.label]:font-[400] block mb-4 [&_.input]:focus:cursor-text [&_.input]:foc us:pointer-events-none
                hover:cursor-text [&_.input]:hover:pointer-events-none"
    value={formData[field.name]}
    onChange={e => dispatch(changeFieldvalue(field.name, e.target.value))}
    {...field}
  />
  else if (field.inputtype === 2) return <MeetingType
    key={field.id}
    field={field}
  />
  else if (field.inputtype === 3) return <MeetingDescription
    key={field.id}
    field={field}
  />
  else if (field.inputtype === 4) return <MeetingRepeat
    key={field.id}
    field={field}
  />
  else if (field.inputtype === 5) return <MeetingBanner
    key={field.id}
    field={field}
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
    onChange={(newValues) => dispatch(changeFieldvalue("allowed_client_type", newValues))}
  />
  else if (field.inputtype === 7) return <SelectOneToOneClient
    key={field.id}
    field={field}
  />
  else if (field.inputtype === 8) return <>
    <label className="text-[14px]">{field.label}</label>
    <TimePicker
      selectedTime={formData.time}
      setSelectedTime={value => dispatch(changeFieldvalue(field.name, value))}
    />
  </>
  else if (field.inputtype === 9) return <UpdateAllowedRollnos
    field={field}
    formData={formData}
    dispatch={dispatch}
    onChange={value => dispatch(changeFieldvalue("allowed_client_rollnos", value))}
  />
}

export function UpdateAllowedRollnos({ field, formData, onChange }) {
  const [newRollnos, setNewRollnos] = useState("")
  const allSeries = formData.allowed_client_rollnos || []
  return <div>
    <div className="mb-4 flex items-end gap-4">
      <FormControl
        key={field.id}
        className="text-[14px] [&_.label]:font-[400] block grow"
        value={newRollnos}
        onChange={e => setNewRollnos(e.target.value)}
        label={field.label}
        placeholder={field.placeholder}
      />
      {newRollnos && <Button
        variant="wz"
        onClick={() => {
          if (allSeries.includes(newRollnos.trim())) {
            toast.error("Roll no series already added");
            return
          }
          onChange([...allSeries, newRollnos.trim().toLocaleLowerCase()]);
          setNewRollnos("")
        }}
      >
        Save
      </Button>}
    </div>
    <div className="flex flex-wrap gap-2">
      {allSeries.map(roll => <div
        key={roll}
        className="relative"
      >
        <Badge>
          {roll}

        </Badge>
        <Minus
          className="text-white bg-[var(--accent-2)] absolute top-0 right-[-8px] translate-y-[-20%]
                      w-[16px] h-[16px] cursor-pointer z-[100] rounded-full"
          strokeWidth={3}
          onClick={() => onChange(allSeries.filter(item => item !== roll)
          )}
        />
      </div>)}
    </div>
  </div>
}