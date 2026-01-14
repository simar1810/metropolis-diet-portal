import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addYears,
  format,
  isBefore,
  setDate,
  setMonth,
} from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ddMMyyyy } from "@/config/data/regex";

export default function UpcomingBirthdays({ birthdays }) {
  const [pagination, setpagination] = useState({
    max: Math.ceil(birthdays.length / 10),
    current: 1,
    limit: 10
  })
  const sortedBirthdays = useMemo(() => getNextBirthdayDate(birthdays), [birthdays])

  const toDisplay = sortedBirthdays.slice(
    (pagination.current - 1) *
    pagination.limit, pagination.current * pagination.limit
  )

  return <div>
    <h5>Upcoming Birthdays</h5>
    <div className="w-full bg-[var(--comp-1)] rounded-xl border-1 my-4 overflow-clip">
      <Table>
        <TableHeader className="bg-white p-4 rounded-xl">
          <TableRow>
            <TableHead>Sr No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Mobile Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toDisplay && toDisplay.length > 0 ? (
            toDisplay.map((client, idx) => (
              <TableRow key={client.clientId || idx}>
                <TableCell>{idx + 1 + (pagination.current - 1) * pagination.limit}</TableCell>
                <TableCell>{client.name || "-"}</TableCell>
                <TableCell>{client.clientId || "-"}</TableCell>
                <TableCell>{client.dob || "-"}</TableCell>
                <TableCell>{client.mobileNumber || "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No Upcoming Birthdays
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="bg-[var(--comp-2)] px-4 py-2 flex items-center justify-between border-t-1">
        <Select value={pagination.limit} onValueChange={(value) => setpagination(prev => ({ ...prev, limit: Number(value) }))}>
          <SelectTrigger className="bg-[var(--comp-1)]">
            <SelectValue placeholder="Select Limit" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--comp-1)]">
            <SelectItem value={10}>10</SelectItem>
            <SelectItem value={15}>15</SelectItem>
            <SelectItem value={20}>20</SelectItem>
            <SelectItem value={25}>25</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setpagination(prev => ({ ...prev, current: prev.current - 1 }))}
            disabled={pagination.current === 1} className
            ="opacity-50 cursor-not-allowed"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setpagination(prev => ({ ...prev, current: prev.current + 1 }))}
            disabled={pagination.current === pagination.max}
            className="opacity-50 cursor-not-allowed"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  </div>
}



function getNextBirthdayDate(birthdays) {
  const today = new Date();
  return birthdays
    .filter(client => ddMMyyyy.test(client.dob))
    .map(client => {
      const [day, month] = (client.dob || "")?.split("-") || [];
      const parsedDate = setMonth(
        setDate(new Date(), day),
        month - 1
      )
      const newDob = isBefore(parsedDate, today)
        ? addYears(parsedDate, 1)
        : parsedDate
      return {
        ...client,
        dob: newDob
      }
    })
    .sort((a, b) => isBefore(a.dob, b.dob) ? -1 : 1)
    .map(client => ({
      ...client,
      dob: format(client.dob, "dd-MM-yyyy")
    }))
}