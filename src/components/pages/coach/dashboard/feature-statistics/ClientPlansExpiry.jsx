import { sortMealPlansByDates } from "./PlansAboutToExpire"
import { useMemo, useState } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { format, isBefore } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ClientPlansExpiry({ plans }) {
  const [pagination, setPagination] = useState({
    max: Math.ceil(plans.length / 10),
    current: 1,
    limit: 10
  })
  const sortedPlans = useMemo(() => normalizeMealPlansSorting(plans), [plans])
  const toDisplay = sortedPlans.slice(
    (pagination.current - 1) *
    pagination.limit, pagination.current * pagination.limit
  )
  return <div>
    <h5>Client Plan Expiry</h5>
    <div className="w-full bg-[var(--comp-1)] rounded-xl border-1 my-4 overflow-clip">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr No</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Expiry Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toDisplay.map((client, index) => <TableRow
            key={client._id}
          >
            <TableCell>{index + 1 + (pagination.current - 1) * pagination.limit}</TableCell>
            <TableCell>{client.name}</TableCell>
            <TableCell>{client.clientId}</TableCell>
            <TableCell>{format(client.expiry, "dd-MM-yyyy")}</TableCell>
            {/* <TableCell>{format(plan.endDate, 'dd-MM-yyyy')}</TableCell> */}
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
  </div>
}

export function normalizeMealPlansSorting(plans) {
  const clients = plans
    .map(plan => plan.clients.map(client => ({ ...client, plan: plan._id })))
    .flatMap(plan => plan)


  const planExpiryDates = sortMealPlansByDates(plans)
  const planExpiryDatesMap = new Map(
    planExpiryDates.map(plan => [plan._id, plan.endDate])
  )

  const clientPlanMap = new Map()

  for (const client of clients) {
    if (
      clientPlanMap.has(client._id) &&
      isBefore(
        clientPlanMap.get(client.plan),
        planExpiryDatesMap.get(client.plan),
      )
    ) {

    } else {
      clientPlanMap.set(
        client._id,
        planExpiryDatesMap.get(client.plan)
      )
    }
  }

  const clientFilterSet = new Set()
  return clients
    .filter(client => {
      if (clientFilterSet.has(client._id)) return false
      clientFilterSet.add(client._id)
      return true
    })
    .map(client => ({
      ...client,
      expiry: clientPlanMap.get(client._id),
    }))
}