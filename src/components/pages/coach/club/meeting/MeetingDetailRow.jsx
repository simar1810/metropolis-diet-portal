import DeleteMeetingModal from "@/components/modals/club/DeleteMeetingModal";
import EditMeetingModal from "@/components/modals/club/EditMeetingModal";
import { TableCell, TableRow } from "@/components/ui/table";
import { copyText } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Clipboard, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function MeetingDetailRow({
  meeting,
  index
}) {
  function copyLink() {
    copyText(meeting.wellnessZLink)
    toast.success("Link copied")
  }
  return <TableRow className="text-center">
    <TableCell>{index + 1}</TableCell>
    <TableCell className="max-w-[60ch] min-w-[40ch] !text-wrap break-all">{meeting.baseLink}</TableCell>
    <TableCell className="max-w-[60ch] min-w-[40ch] !text-wrap break-all flex items-start justify-between gap-2 overflow-clip">
      <span>{meeting.wellnessZLink}</span>
      <Clipboard onClick={copyLink} className="min-w-[16px] cursor-pointer" />
    </TableCell>
    <TableCell>
      {meeting.scheduleDate
        ? format(parseISO(meeting.scheduleDate), 'dd-MM-yyyy')
        : <>-</>}
    </TableCell>
    <TableCell>
      {meeting.scheduleDate
        ? format(meeting.scheduleDate, 'hh:mm a')
        : <>-</>}
    </TableCell>
    <TableCell>
      <Link
        className="flex items-start justify-center gap-2"
        href={`/coach/club/meetings/${meeting.wellnessZLink.split("/").pop()}`}
      >
        <span>{meeting.attendenceList.length}</span>
        <Eye className="w-[16px] h-[16px]" />
      </Link>
    </TableCell>
    <TableCell>{meeting.meetingType}</TableCell>
    <TableCell>{meeting.clubType}</TableCell>
    <TableCell>-</TableCell>
    <TableCell className="flex items-start justify-center gap-2">
      <EditMeetingModal meeting={meeting} />
      <DeleteMeetingModal _id={meeting._id} />
    </TableCell>
  </TableRow>
}