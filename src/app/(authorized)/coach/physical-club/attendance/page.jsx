"use client"
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { getPhysicalAttendance } from "@/lib/fetchers/app";
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format, startOfDay } from "date-fns"
import { getMembershipType } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const { isLoading, error, data } = useSWR(
    "app/physical-club/attendance",
    () => getPhysicalAttendance({
      person: "coach",
      populate: "client:name|mobileNumber|rollno,membership:membershipType|pendingServings|endDate"
    })
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const attendance = data?.data?.results || []

  return <div className="content-container content-height-screen">
    <h4>Club Attendance</h4>
    <Table className="bg-[var(--comp-1)] mt-4 border-1">
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Roll No</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Membership Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Pending Servings</TableHead>
          <TableHead>Attendance Stats</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((attendance) => <AttendanceItem
          key={attendance._id}
          attendance={attendance}
        />)}
      </TableBody>
    </Table>
  </div>
}

function AttendanceItem({ attendance }) {
  const {
    type: membershipType,
    end: membershipEnd
  } = getMembershipType(attendance.membership)
  
  // Calculate statistics from attendance data
  const attendanceRecords = attendance.attendance || []
  const presentAttendances = attendanceRecords.filter(att => att.status === "present")
  const uniqueDays = new Set(presentAttendances.map(att => {
    try {
      return startOfDay(new Date(att.date)).getTime()
    } catch (error) {
      console.warn("Invalid date for statistics:", att.date)
      return null
    }
  }).filter(Boolean)).size
  const totalServings = presentAttendances.length
  const unmarkedServings = attendanceRecords.filter(att => att.status === "unmarked").length
  
  return (
    <TableRow
      className="hover:bg-gray-50 cursor-pointer"
    >
      <TableCell>
        <Link
          href={`/coach/physical-club/attendance/${attendance.client?._id}`}
          className="text-blue-600 hover:underline"
        >
          {attendance.client?.name || "Unknown"}
        </Link>
      </TableCell>
      <TableCell>{attendance.client?.rollno}</TableCell>
      <TableCell>{attendance.client?.mobileNumber}</TableCell>
      <TableCell>{membershipType}</TableCell>
      <TableCell>
        {attendance.membership.membershipType === 1
          ? attendance.membership.startDate ? new Date(attendance.membership.startDate).toLocaleDateString() : "—"
          : <>-</>}
      </TableCell>
      <TableCell>
        {attendance.membership.membershipType === 1
          ? attendance.membership.endDate ? new Date(attendance.membership.endDate).toLocaleDateString() : "—"
          : <>-</>}
      </TableCell>
      {attendance.membership.membershipType === 2
        ? <TableCell>{attendance.membership.pendingServings ?? "—"}</TableCell>
        : <TableCell>-</TableCell>}
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {uniqueDays} days
            </Badge>
            <Badge variant="default" className="text-xs">
              {totalServings} servings
            </Badge>
          </div>
          {unmarkedServings > 0 && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
              {unmarkedServings} unmarked
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}