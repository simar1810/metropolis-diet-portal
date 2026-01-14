import { useMemo, useState } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { addDays, format, isBefore, parse } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"


export default function PlansAboutToExpire({ plans = [] }) {
  const [pagination, setPagination] = useState({
    max: Math.ceil(plans.length / 10),
    current: 1,
    limit: 10
  })
  const sortedPlans = useMemo(() => sortMealPlansByDates(plans), [plans])
  const toDisplay = sortedPlans.slice(
    (pagination.current - 1) *
    pagination.limit, pagination.current * pagination.limit
  )
  return <div>
    <h5>Incomplete Plans</h5>
    <div className="w-full bg-[var(--comp-1)] rounded-xl border-1 my-4 overflow-clip">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr No</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Last Date</TableHead>
            <TableHead>Missing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {toDisplay.map((plan, index) => <TableRow
            key={plan._id}
          >
            <TableCell>{index + 1 + (pagination.current - 1) * pagination.limit}</TableCell>
            <TableCell>{plan.title}</TableCell>
            <TableCell>{format(plan.endDate, 'dd-MM-yyyy')}</TableCell>
            <TableCell>
              {plan.missingDates.length === 0 ? (
                <Badge variant="secondary" className="text-xs">0</Badge>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge variant="outline" className="cursor-pointer text-xs">
                      {plan.missingDates.length}
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <ScrollArea className="max-h-56">
                      <div className="flex flex-wrap gap-1">
                        {plan.missingDates.map((date) => (
                          <Badge key={date} variant="secondary" className="text-[10px]">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
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
  </div>
}

export function sortMealPlansByDates(plans) {
  return plans
    .map(plan => {
      const allDates = Object
        ?.keys(plan?.plans || {})
        ?.map(plan => parse(plan, 'dd-MM-yyyy', new Date()))
        ?.sort((a, b) => isBefore(b, a) ? -1 : 1)
      const endDate = allDates?.at(0);
      const startDate = allDates?.at(allDates.length - 1);
      plan.missingDates = findPendingDates(startDate, allDates, plan.noOfDays);
      plan.endDate = endDate;
      return plan
    })
    .sort((a, b) => isBefore(a.endDate, b.endDate) ? 1 : -1)
}

function findPendingDates(startDate, dates, noOfDates = 30) {
  if (!startDate || !Array.isArray(dates) || noOfDates <= 0) return [];
  const availableDatesSet = new Set(
    dates.map(date => format(date, "dd-MM-yyyy"))
  );

  const missingDates = [];
  for (let index = 0; index < noOfDates; index++) {
    const expectedDate = addDays(startDate, index);
    const key = format(expectedDate, "dd-MM-yyyy");
    if (!availableDatesSet.has(key)) {
      missingDates.push(expectedDate);
    }
  }
  return missingDates.map(date => format(date, "dd-MM-yyyy"));
}