"use client"
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import MeetingAttendanceRow from "@/components/pages/coach/club/meeting/MeetingAttendanceRow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getMeeting, getMeetingZoomEvents } from "@/lib/fetchers/club";
import { addMinutes, format, isBefore, parse, parseISO } from "date-fns";
import { Upload } from "lucide-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import MeetingZoomEvent from "@/components/pages/coach/club/meeting/MeetingZoomEvent";
import { meetingAttendaceExcel } from "@/lib/formatter";
import * as XLSX from "xlsx";
import { ddMMyyyy } from "@/config/data/regex";

export default function Page() {
  const { id } = useParams()
  const { isLoading, error, data } = useSWR(`getMeeting/${id}`, () => getMeeting(id))

  if (isLoading) return <ContentLoader />

  if (!data.success || error) return <ContentError title={data.message || error} />

  const meeting = data.data;

  function downloadExcelData() {
    const excelData = meetingAttendaceExcel(meeting.meetingType, meeting.attendenceList)

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    Object.keys(worksheet).forEach(cell => {
      if (cell[0] !== "!") {
        worksheet[cell].s = { alignment: { wrapText: true, vertical: "top" } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    XLSX.writeFile(workbook, "attendance.xlsx");
  }

  return <div className="content-container">
    <div className="text-[20px] mb-4 flex items-center justify-between gap-4">
      <h4>Meet Link</h4>
      {meeting.scheduleDate && <div>
        Date:&nbsp;
        {format(parseISO(meeting.scheduleDate), 'dd-MM-yyyy')}
      </div>}
    </div>
    <div className="py-4 flex items-center justify-between gap-2 border-t-1">
      <span>{meeting?.attendenceList?.length} Records Available</span>
      <Button
        onClick={downloadExcelData}
        size="sm"
        variant="wz_outline"
      >
        <Upload />
        Export Records
      </Button>
    </div>
    <div className="w-[calc(100vw-68px)] md:w-[calc(100vw-344px)] overflow-x-auto">
      <MeetingAttendanceTable meetingType={meeting.meetingType} attendenceList={meeting.attendenceList} />
      <MeetingEventsTable _id={meeting._id} />
    </div>
  </div>
}

function MeetingAttendanceTable({ meetingType, attendenceList }) {
  if (attendenceList.length === 0) return <ContentError
    className="!min-h-[200px] font-[600] mt-4 mb-8"
    title="No record for this meeting found!"
  />

  return <Table className="bordered-table [&_th]:font-bold [&_th]:text-center mb-10">
    <TableCaption>Meeting Attendance</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Sr. No</TableHead>
        <TableHead>Client Name</TableHead>
        <TableHead>Roll No</TableHead>
        <TableHead>Joining Date</TableHead>
        <TableHead>Joining Time</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {meetingType === "reocurr"
        ? <ReocurringMeetingAttendanceTable attendenceList={attendenceList} />
        : attendenceList.map((attendance, index) => <MeetingAttendanceRow
          key={index}
          index={index}
          attendance={attendance}
        />)}
    </TableBody>
  </Table>
}

function ReocurringMeetingAttendanceTable({ attendenceList }) {
  const meetings = sortMeetings(attendenceList)
  return <>
    {meetings.map((attendance, index) => <TableRow key={index}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        {attendance.details.map((detail, index) => <p className="py-[2px]" key={index}>{detail.name}</p>)}</TableCell>
      <TableCell className="px-0 py-0 divide-y-1">
        {attendance.details.map((detail, index) => <p className="py-[2px]" key={index}>{detail.rollno}</p>)}
      </TableCell>
      <TableCell className="px-0 py-0 divide-y-1">
        {attendance?.commonDate}
      </TableCell>
      <TableCell className="px-0 py-0 divide-y-1">
        {attendance.details.map((detail, index) => <p className="py-[2px]" key={index}>{format(addMinutes(parse(detail?.time, "hh:mm:ss a", new Date()), 330), "hh:mm a")}</p>)}
      </TableCell>
    </TableRow>)}
  </>
}

function MeetingEventsTable({ _id }) {
  const { isLoading, error, data } = useSWR(`zoom/${_id}/event`, () => getMeetingZoomEvents(_id));

  if (isLoading) return <ContentLoader />

  if (!data.success || error) return <ContentError title={data.message || error} />

  const events = data.data;

  return <Table className="bordered-table [&_th]:font-bold [&_th]:text-center">
    <TableCaption>Meeting Events</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Sr. No</TableHead>
        <TableHead>Event Type</TableHead>
        <TableHead>Client Name</TableHead>
        <TableHead>Time Stamp</TableHead>
        <TableHead>Reason</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {events.zoom_events.map((event, index) => <MeetingZoomEvent
        key={index}
        index={index}
        event={event}
      />)}
    </TableBody>
  </Table>
}

function sortMeetings(meetings) {
  return meetings
    .filter(meeting => ddMMyyyy.test(meeting.commonDate))
    .sort((dateA, dateB) => isBefore(
      parse(dateA.commonDate, "dd-MM-yyyy", new Date),
      parse(dateB.commonDate, "dd-MM-yyyy", new Date())
    ) ? -1 : 1)
}