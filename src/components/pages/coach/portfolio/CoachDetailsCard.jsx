import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import {
  Clipboard,
  Link2,
} from "lucide-react";
import { coachPortfolioFields } from "@/config/data/ui";
import UpdateCoachAboutModal from "@/components/modals/coach/UpdateCoachAboutModal";
import UpdateCoachSpecializationModal from "@/components/modals/coach/UpdateCoachSpecializationModal";
import Link from "next/link";
import UpdatePersonalDetails from "@/components/modals/coach/UpdateDetailsModal";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { sendData } from "@/lib/api";
import { mutate } from "swr";
import FormControl from "@/components/FormControl";
import { _throwError } from "@/lib/formatter";
import { format, parse } from "date-fns";
import DeleteClientNudges from "../client/DeleteClientNudges";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

const COACH_WEBSITE_BASE_LINK = "https://coaches.wellnessz.in"

export default function CoachDetailsCard({ coachData }) {
  const { coachId } = useAppSelector(state => state.coach.data);

  const messageTimings = coachData.messageTimings ?? {};

  function copyInviteLink() {
    copyText(`Hey! 👋

I just joined *Metro Polis*, an amazing wellness & coaching app 💚

Register now using my link and let’s begin your health journey together 💪👇
https://wellnessz.in/app/coachCode?coachID=${coachId}`)
    toast.success("Invite Link copied")
  }

  return <Card className="bg-white rounded-[18px] shadow-none">
    <CardHeader className="relative flex items-start gap-4 md:gap-8">
      <Avatar className="w-[100px] h-[100px]">
        <AvatarImage src={coachData.profilePhoto} />
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="my-2">{coachData.name}</h4>
        <p className="text-[14px] text-[var(--dark-2)] font-semibold leading-[1] mb-2">
          <Button
            onClick={() => {
              copyText(coachId)
              toast.success("Coach ID copied")
            }}
            variant="icon"
            className="text-[var(--accent-1)] h-auto py-0"
          >
            <Clipboard className="w-[20px] h-[20px]" strokeWidth={3} />
          </Button>
          ID #{coachData.coachId}
        </p>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <h4>About</h4>
        <UpdateCoachAboutModal defaultValue={coachData.about} />
      </div>
      <p className="text-[14px] text-[var(--dark-2)] leading-[1.3] mt-2 pb-4 border-b-1">{coachData.about}</p>
      <div className="mt-4 flex items-center justify-between">
        <h4>Specialization</h4>
        <UpdateCoachSpecializationModal defaultValue={coachData.specialization} />
      </div>
      <p className="text-[14px] text-[var(--dark-2)] leading-[1.3] mt-2 pb-4 border-b-1">{coachData.specialization}</p>
      <div className="mt-4 flex items-center justify-between">
        <h4>Personal Information</h4>
        <UpdatePersonalDetails coachData={coachData} />
      </div>
      <div className="mt-4 pl-4 pb-4 border-b-1">
        {coachPortfolioFields.map(field => <div key={field.id} className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>{field.title}</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{coachData[field.name]}</p>
        </div>)}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h4>Coach Timings</h4>
        <UpdateCoachTimingsModal messageTimings={coachData.messageTimings} />
      </div>

      <div className="mt-4 pl-4 pb-4 border-b-1">
        <div className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>Opening Time</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{messageTimings.openingTime || "—"}</p>
        </div>
        <div className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>Closing Time</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{messageTimings.closingTime || "—"}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h4>Personal Portfolio</h4>
        <Link
          target="_blank"
          href={`${COACH_WEBSITE_BASE_LINK}/${coachData.coachId}`}
          className="bg-[var(--accent-1)] text-white text-[14px] font-bold px-3 py-1 flex items-center gap-2 rounded-[4px]"
        >
          <Link2 />
          Go To Store
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h4>Invite Link</h4>
        <Button
          variant="wz"
          className="w-auto h-auto py-1 !font-bold gap-2 rounded-[4px]"
          onClick={copyInviteLink}
        >
          <Link2 size={48} className="!w-[24px] !h-[24px]" />
          Invite Link
        </Button>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h4>Delete All Client Nudges</h4>
        <DeleteClientNudges description="Are you sure you want to delete all notifications for all clients?">
          <AlertDialogTrigger asChild>
            {/* <Trash2 className="w-[32px] h-[32px] text-white bg-[var(--accent-2)] p-[6px] rounded-[4px]" /> */}
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
        </DeleteClientNudges>
      </div>
    </CardContent>
  </Card>
}

function to24HourFormat(timeStr) {
  if (!timeStr?.trim()) return ""
  try {
    const parsedTime = parse(timeStr.trim(), "hh:mm a", new Date())
    return format(parsedTime, "HH:mm")
  } catch (error) {
    return ""
  }
}

function to12HourFormat(timeStr) {
  if (!timeStr?.trim()) return ""
  try {
    const parsedTime = parse(timeStr.trim(), "HH:mm", new Date())
    return format(parsedTime, "hh:mm a")
  } catch {
    return ""
  }
}

function UpdateCoachTimingsModal({ messageTimings = {} }) {
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState({
    openingTime: to24HourFormat(messageTimings.openingTime),
    closingTime: to24HourFormat(messageTimings.closingTime)
  })

  const closeBtnRef = useRef()

  async function udpateTimings() {
    try {
      setLoading(true);
      const response = await sendData("app/chat-timings", {
        openingTime: to12HourFormat(payload.openingTime),
        closingTime: to12HourFormat(payload.closingTime),
      });
      if (response.status_code !== 200) _throwError(response.message);
      toast.success(response.message);
      mutate("coachProfile");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger asChild>
      <Button
        size="sm"
        variant="wz"
      >Edit</Button>
    </DialogTrigger>
    <DialogContent className="p-0 max-h-[70vh] overflow-y-auto">
      <DialogClose ref={closeBtnRef} />
      <DialogTitle className="border-b-1 p-4">Coach Timings</DialogTitle>
      <div className="p-4 pt-0">
        <FormControl
          type="time"
          value={payload.openingTime}
          className="mb-4 block"
          onChange={e => setPayload(prev => ({
            ...prev,
            openingTime: e.target.value
          }))}
        />
        <FormControl
          type="time"
          value={payload.closingTime}
          onChange={e => setPayload(prev => ({
            ...prev,
            closingTime: e.target.value
          }))}
        />
        <Button
          className="mt-4"
          variant="wz"
          disabled={loading}
          onClick={udpateTimings}
        >Save</Button>
      </div>
    </DialogContent>
  </Dialog>
}
