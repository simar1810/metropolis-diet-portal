import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import TimePicker from "@/components/common/TimePicker";
import FormControl from "@/components/FormControl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
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
import { reminderFormInputs } from "@/config/data/other-tools";
import {
  changeClientQuery,
  changeFieldValue,
  changeView,
  generateReminderPayload,
  init,
  reminderReducer,
  setAttendeeType
} from "@/config/state-reducers/reminder";
import { sendData } from "@/lib/api";
import { getAppClients } from "@/lib/fetchers/app";
import { nameInitials } from "@/lib/formatter";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { RadioGroup } from "@radix-ui/react-dropdown-menu";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export default function ReminderModal({
  children,
  type,
  payload
}) {
  return <CurrentStateProvider
    state={init(payload, type)}
    reducer={reminderReducer}
  >
    <Dialog>
      {children}
      <DialogContent className="!max-w-[450px] max-h-[65vh] w-full p-0 overflow-y-auto gap-0">
        <DialogHeader className="p-4 border-b-1">
          <DialogTitle>Appointment</DialogTitle>
        </DialogHeader>
        <ReminderFormContainer
          type={type}
          _id={payload?._id}
        />
      </DialogContent>
    </Dialog>
  </CurrentStateProvider>
}

async function getLink(type, data, _id) {
  if (type === "UPDATE") {
    const response = await sendData("app/update-reminder?person=coach&id=" + _id, data, "PUT");
    return response;
  } else {
    const response = await sendData("app/addReminder?person=coach", data);
    return response;
  }
}

function ReminderFormContainer({ type, _id }) {
  const [loading, setLoading] = useState(false);

  const { dispatch, other, view, ...state } = useCurrentStateContext();
  const closeBtnRef = useRef();

  async function addReminder() {
    try {
      setLoading(true);
      const data = generateReminderPayload({ other, ...state });
      const response = await getLink(type, data, _id)
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("app/getAllReminder?person=coach");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="p-4">
    {view === 1
      ? <div>
        {reminderFormInputs.map(field => fieldComponent(field, state, dispatch))}
        <Button
          disabled={loading}
          className="w-full mt-4"
          variant="wz"
          onClick={addReminder}
        >
          Save Appointment
        </Button>
      </div>
      : <SelectClients />}
    <DialogClose ref={closeBtnRef} />
  </div>
}

function fieldComponent(field, formData, dispatch) {
  switch (field.component) {
    case 1:
      return <FormControl
        key={field.id}
        value={formData[field.name]}
        onChange={e => dispatch(changeFieldValue(field.name, e.target.value))}
        className="text-[14px] [&_.label]:!font-[500] mb-2 block"
        {...field}
      />
    case 2:
      return <ReminderAgenda
        key={field.id}
        field={field}
        formData={formData}
      />
    case 3:
      return <ReminderAttendeeType
        key={field.id}
        field={field}
        formData={formData}
      />
    case 4:
      return <div key={field.id} className="mt-4">
        <label className="text-[14px]">{field.label}</label>
        <TimePicker
          selectedTime={formData[field.name]}
          setSelectedTime={value => dispatch(changeFieldValue(field.name, value))}
        />
      </div>
    default:
      return
  }
}

function ReminderAgenda({ field }) {
  const { agenda, dispatch } = useCurrentStateContext();
  return <div className="mt-4">
    <Label className="text-[14px] mb-2" htmlFor="reminder-agenda">{field.label}</Label>
    <Textarea
      id="reminder-agenda"
      value={agenda}
      onChange={e => dispatch(changeFieldValue(field.name, e.target.value))}
      className="min-h-[100px]"
      {...field}
    />
  </div>
}

function ReminderAttendeeType({ field }) {
  const { attendeeType, other, dispatch } = useCurrentStateContext();

  if (attendeeType === "none") return <></>

  return <div className="mt-4">
    <p className="text-[14px] mb-2">{field.label}</p>
    <RadioGroup value={attendeeType} className="flex items-center gap-4">
      {field.options.map(option => <div key={option.id} className="flex items-center gap-1">
        <input
          id={option.valuex}
          value={option.value}
          type="radio"
          checked={attendeeType === option.valuex}
          onChange={() => dispatch(setAttendeeType(option.valuex))}
          className="w-[14px] h-[14px]"
        />
        <Label htmlFor={option.valuex}>
          {option.label}
        </Label>
      </div>)}
    </RadioGroup>
    <FormControl
      className="text-[14px] block mt-4"
      placeholder="Search client..."
      value={other}
      onChange={e => dispatch(changeClientQuery(e.target.value))}
      onFocus={() => dispatch(changeView())}
    />
  </div>
}

const query = {
  page: 1,
  limit: 500
}

function SelectClients() {
  const [searchTerm, setSearchTerm] = useState("");
  const { client, dispatch } = useCurrentStateContext();

  const { isLoading, error, data } = useSWR(
    `app/getAppClients`,
    () => getAppClients(query)
  );

  if (isLoading) return <Loader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const clients = data.data
    .filter(c => new RegExp(searchTerm, "i").test(c.name));
  return <div>
    <FormControl
      placeholder="Search client..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="text-[14px] block mb-4"
    />
    {clients.map(clientData => <ClientCard
      key={clientData._id}
      client={clientData}
      selectedClient={client}
      setSetSelectedClients={(value) => dispatch(changeFieldValue("client", value))}
    />)}
    {client && <div className="bg-white py-2 sticky bottom-0">
      <Button onClick={() => dispatch(changeView(1))} className="w-full">Done</Button>
    </div>}
  </div>
}

function ClientCard({
  client,
  selectedClient,
  setSetSelectedClients
}) {
  return <label className="max-w-[400px] mb-2 cursor-pointer mx-auto flex items-center gap-4 border-b-1 py-2">
    <Avatar className="w-[40px] h-[40px] rounded-[4px]">
      <AvatarImage src={client.profilePhoto} />
      <AvatarFallback className="rounded-[4px]">{nameInitials(client.name)}</AvatarFallback>
    </Avatar>
    <p className="font-bold text-[14px]">{client.name}</p>
    <input
      type="checkbox"
      className="w-[20px] h-[20px] ml-auto"
      checked={selectedClient === client._id}
      onChange={() => setSetSelectedClients(selectedClient === client._id ? null : client._id)}
    />
  </label>
}