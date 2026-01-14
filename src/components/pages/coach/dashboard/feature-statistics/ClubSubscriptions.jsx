import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { isBefore } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

export default function ClubSubscriptions({ subscriptions }) {
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    max: Math.ceil(subscriptions.length / 10)
  })
  const sortedSubscriptions = useMemo(() => sortClubSubscriptions(subscriptions), [subscriptions])

  const toDisplay = sortedSubscriptions.slice(
    (pagination.current - 1) *
    pagination.limit, pagination.current * pagination.limit
  )

  return <div>
    <h5>Club Subscriptions</h5>
    <div className="w-full bg-[var(--comp-1)] rounded-xl border-1 my-4 overflow-clip">
      <Table>
        <TableHeader className="bg-white p-4 rounded-xl">
          <TableRow>
            <TableHead>Sr No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toDisplay.map((subscription, index) => <TableRow key={subscription._id}>
            <TableCell>{index + 1 + (pagination.current - 1) * pagination.limit}</TableCell>
            <TableCell>{subscription?.client?.name}</TableCell>
            <TableCell>{subscription?.client?.clientId}</TableCell>
            <TableCell>{subscription?.client?.mobileNumber || <>-</>}</TableCell>
            <TableCell>
              {subscription?.status === "Active" ? (
                <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-semibold">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                  In Active
                </span>
              )}
            </TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
      <div className="bg-[var(--comp-2)] px-4 py-2 flex items-center justify-between border-t-1">
        <Select value={pagination.limit} onValueChange={(value) => setPagination(prev => ({ ...prev, limit: Number(value) }))}>
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
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
            disabled={pagination.current === 1} className
            ="opacity-50 cursor-not-allowed"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
            disabled={pagination.current === pagination.max}
            className="opacity-50 cursor-not-allowed"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  </div >
}

function sortClubSubscriptions(subscriptions) {
  return subscriptions
    .map(subscription => ({
      ...subscription,
      history: subscription
        .history
        .sort((a, b) => isBefore(b.endDate, a.endDate))
    }))
    .sort((a, b) => isBefore(
      (a?.history?.at(0)?.endDate),
      b?.history?.at(0)?.endDate
    ))
}