"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  addMonths,
  format,
  isSameDay,
  isToday,
  isWithinInterval,
  max,
  min,
  set,
  startOfMonth,
  subMonths,
} from "date-fns"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function CustomCalendar({
  mode = "both", // drag, click, both, single
  badgeData = {},
  className,
  range,
  onRangeSelect,
}) {
  const [currentDate, setCurrentDate] = useState(range?.from || new Date())
  const [selectedRange, setSelectedRange] = useState({
    from: range?.from || null,
    to: range?.to || null,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)

  const [clickStart, setClickStart] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const previousMonth = () => {
    setCurrentDate(subMonths(startOfMonth(currentDate), 1))
  }
  const nextMonth = () => {
    setCurrentDate(addMonths(startOfMonth(currentDate), 1))
  }

  const formatDateKey = (date) => format(date, "yyyy-MM-dd")

  const isDateInRange = (date, start, end) =>
    isWithinInterval(date, { start: min([start, end]), end: max([start, end]) })

  const isDateRangeStart = (date, start, end) =>
    isSameDay(date, min([start, end]))

  const isDateRangeEnd = (date, start, end) =>
    isSameDay(date, max([start, end]))

  const handleMouseDown = (date) => {
    setIsDragging(true)
    setDragStart(date)
    setDragEnd(date)
  }
  const handleMouseEnter = (date) => {
    if (isDragging) setDragEnd(date)
  }
  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const start = dragStart <= dragEnd ? dragStart : dragEnd
      const end = dragStart <= dragEnd ? dragEnd : dragStart
      const newRange = { from: start, to: end }
      setSelectedRange(newRange)
      onRangeSelect?.(newRange)
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  const handleClick = (date) => {
    if (!clickStart) {
      if (["both", "click"].includes(mode)) setClickStart(date)
      const newRange = { from: date, to: date }
      setSelectedRange(newRange)
      onRangeSelect?.(newRange)
    } else {
      const start = clickStart <= date ? clickStart : date
      const end = clickStart <= date ? date : clickStart
      const newRange = { from: start, to: end }
      setSelectedRange(newRange)
      onRangeSelect?.(newRange)
      if (["both", "click"].includes(mode)) setClickStart(null)
    }
  }

  const renderCalendarDays = () => {
    const days = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = set(new Date(), { year, month, date: day })
      const dateKey = formatDateKey(date)
      const badges = badgeData[dateKey] || []
      const todayClass = isToday(date)

      const activeStart = isDragging ? dragStart : selectedRange.from
      const activeEnd = isDragging ? dragEnd : selectedRange.to

      const isInSelectedRange =
        activeStart && activeEnd && isDateInRange(date, activeStart, activeEnd)
      const isRangeStart =
        activeStart && activeEnd && isDateRangeStart(date, activeStart, activeEnd)
      const isRangeEnd =
        activeStart && activeEnd && isDateRangeEnd(date, activeStart, activeEnd)

      days.push(
        <div
          key={day}
          className={cn(
            "h-20 border border-gray-200 p-2 relative flex flex-col cursor-pointer select-none rounded-[6px]",
            todayClass && "border-2 border-green-500 bg-green-50",
            [0, 6].includes(date.getDay()) && "bg-[var(--comp-1)]",
            isInSelectedRange && "bg-blue-100",
            (isRangeStart || isRangeEnd) && "bg-blue-200"
          )}
          onClick={() => handleClick(date)}
          onMouseDown={() => handleMouseDown(date)}
          onMouseEnter={() => handleMouseEnter(date)}
          onMouseUp={handleMouseUp}
        >
          <div className="flex flex-col justify-between items-start">
            <span className={cn("text-sm font-medium", todayClass ? "text-green-600" : "text-gray-900")}>
              {day}
            </span>
            {todayClass && <span className="text-xs text-green-600 font-medium">Today</span>}
          </div>
          {badges.length > 0 && (
            <div className="flex gap-1 mt-auto">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={cn("text-white text-[12px] font-bold px-1 py-0.5 rounded", badge.color)}
                >
                  {badge.value}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }
    return days
  }

  return (
    <div onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <Card className={cn("py-6 px-4 md:p-6 shadow-none max-w-4xl w-full mx-auto gap-0", className)}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {MONTHS[month]}, {year}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-7 mb-0 gap-2 md:gap-1">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="md:p-2 text-center">
                <span className={cn("text-[7px] md:text-xs font-bold", index === 0 || index === 6 ? "text-gray-900" : "text-gray-400")}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-1">{renderCalendarDays()}</div>
        </div>

        {selectedRange.from && selectedRange.to && (
          <div className="mt-4 text-sm text-gray-600">
            Selected Range:{" "}
            <span className="font-medium">
              {selectedRange.from.toDateString()} - {selectedRange.to.toDateString()}
            </span>
          </div>
        )}
      </Card>
    </div>
  )
}
