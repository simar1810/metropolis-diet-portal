import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClientAttendance } from "@/lib/fetchers/club";
import useSWR from "swr";

export default function AttendanceRecord({ _id }) {
  const { isLoading, error, data } = useSWR(`getClientAttendance/${_id}`, () => getClientAttendance(_id));

  if (isLoading) return <div className="h-[200px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || !data.success) return <ContentError className="!min-h-[200px] mt-4 mb-8" title={error || data?.message} />

  const attendance = data.data;
  if (attendance.length === 0) return <div className="mb-8">
    <ContentError className="!min-h-[200px] mt-4 mb-8" title="This client has 0 attendance" />
  </div>

  return <div className="mb-8 w-[87vw] overflow-x-auto no-scrollbar md:w-auto">
    <h5>Attendance Record</h5>
    <Table className="bordered-table mt-4 [&_th]:font-bold">
      <TableHeader>
        <TableRow className="[&_th]:text-center">
          <TableHead>Sr No.</TableHead>
          <TableHead>Meet ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((record, index) => <TableRow key={index}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{record.meet_id.split("/").pop()}</TableCell>
          <TableCell>{record.date}</TableCell>
          <TableCell>{record.time}</TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
  </div>
}