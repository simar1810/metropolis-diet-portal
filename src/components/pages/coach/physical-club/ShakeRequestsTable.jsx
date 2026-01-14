"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { shakeRequests } from "@/lib/physical-attendance";
import { addMinutes, endOfDay, format, isAfter, isBefore, startOfDay } from "date-fns";
import ChangeClientAttendanceStatus from "./ChangeClientAttendanceStatus";

export default function ShakeRequestsTable({
  range: { from, to },
  query,
  data = []
}) {
  const filteredRequests = shakeRequests(data)
    .filter(client => new RegExp(query, "i").test(client?.name))
    .filter(item =>
      isBefore(new Date(item.date), endOfDay(to)) &&
      isAfter(addMinutes(new Date(item.date), 2), startOfDay(from))
    )
  return (
    <TabsContent value="shake-requests" className="bg-[var(--comp-1)] border-1 space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr No.</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Marked Date</TableHead>
            <TableHead>Marked Time</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((req, index) => (
            <TableRow key={index + 1}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{req.name}</TableCell>
              <TableCell>{format(req.date, "dd-MM-yyyy")}</TableCell>
              <TableCell>{format(req.markedAt, "dd-MM-yyyy")}</TableCell>
              <TableCell>{format(req.markedAt, "h:mm a")}</TableCell>
              <TableCell className="flex justify-end gap-2">
                {req.status === "requested" && (
                  <>
                    <ChangeClientAttendanceStatus
                      clientId={req.clientId}
                      status="present"
                      date={req.date}
                      servingNumber={req.servingNumber}
                    >
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        Approve
                      </Button>
                    </ChangeClientAttendanceStatus>
                    <ChangeClientAttendanceStatus
                      clientId={req.clientId}
                      status="absent"
                      date={req.date}
                      servingNumber={req.servingNumber}
                    >
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600"
                      >
                        ✕
                      </Button>
                    </ChangeClientAttendanceStatus>
                  </>
                )}
                {req.status === "present" && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700"
                  >
                    ● Present
                  </Badge>
                )}
                {req.status === "absent" && (
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-700"
                  >
                    ● Absent
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredRequests.length === 0 && <div className="bg-white m-4 border-1 rounded-[6px] h-[200px] flex items-center justify-center font-bold">
        No Matches Found!
      </div>}
    </TabsContent>
  );
}