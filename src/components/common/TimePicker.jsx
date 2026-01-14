"use client"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, X } from "lucide-react"
import { setHours, setMinutes, format, parse } from "date-fns"
import clsx from "clsx"
import { toast } from "sonner"
import useClickOutside from "@/hooks/useClickOutside"

function parseTime(timeStr) {
  if (!timeStr) return {
    defaultHours: 12,
    defaultMinutes: 0,
    defaultAmPm: "AM"
  }
  let date

  try {
    if (/am|pm/i.test(timeStr)) {
      // Already in 12-hour format
      date = parse(timeStr, "hh:mm a", new Date())
    } else {
      // Handle 24-hour format - try with seconds first, then without
      if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
        date = parse(timeStr, "HH:mm:ss", new Date())
      } else {
        date = parse(timeStr, "HH:mm", new Date())
      }
    }

    const hours = format(date, "hh")
    const minutes = format(date, "mm")
    const ampm = format(date, "a")

    return {
      defaultHours: hours,
      defaultMinutes: minutes,
      defaultAmPm: ampm
    }
  } catch (error) {
    return {
      defaultHours: 12,
      defaultMinutes: 0,
      defaultAmPm: "AM"
    }
  }
}

export default function TimePicker({ selectedTime, setSelectedTime }) {
  const {
    defaultHours,
    defaultMinutes,
    defaultAmPm
  } = parseTime(selectedTime)
  const [hour, setHour] = useState(defaultHours)
  const [minute, setMinute] = useState(defaultMinutes)
  const [period, setPeriod] = useState(defaultAmPm)
  const [open, setOpen] = useState(false)
  const isInitialMount = useRef(true)
  const lastSelectedTime = useRef(selectedTime)
  const isSyncingFromProp = useRef(false)
  const outsideRef = useRef()

  useClickOutside(outsideRef, () => setOpen(false))

  useEffect(() => {
    if (selectedTime && selectedTime !== lastSelectedTime.current) {
      isSyncingFromProp.current = true
      const parsed = parseTime(selectedTime)
      setHour(parsed.defaultHours)
      setMinute(parsed.defaultMinutes)
      setPeriod(parsed.defaultAmPm)
      lastSelectedTime.current = selectedTime
      setTimeout(() => {
        isSyncingFromProp.current = false
      }, 0)
    }
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [selectedTime])

  useEffect(() => {
    if (isInitialMount.current || isSyncingFromProp.current) {
      return
    }

    if (hour && minute !== undefined && minute !== null && period) {
      let h = Number(hour)
      if (period === "PM" && h !== 12) h += 12
      if (period === "AM" && h === 12) h = 0

      let date = new Date()
      date = setHours(date, h)
      date = setMinutes(date, Number(minute))
      const formattedTime = format(date, "hh:mm a")

      if (formattedTime !== selectedTime) {
        setSelectedTime(formattedTime)
        lastSelectedTime.current = formattedTime
      }
    }
  }, [hour, minute, period])

  const handleHourInput = (val) => {
    if (val === "") {
      setHour("")
      return
    }
    const h = Number(val)
    if (isNaN(h) || h < 1 || h > 12) {
      toast.error("Hour must be between 1 and 12")
      return
    }
    setHour(h)
  }

  const handleMinuteInput = (val) => {
    if (val === "") {
      setMinute("")
      return
    }
    const m = Number(val)
    if (isNaN(m) || m < 0 || m > 59) {
      toast.error("Minutes must be between 0 and 59")
      return
    }
    setMinute(m)
  }

  return (
    <Popover open={open}>
      <PopoverTrigger
        onClick={() => setOpen(prev => !prev)}
        asChild
      >
        <Button variant="outline" className="w-full mb-2 justify-between">
          {selectedTime || "Select time"}
          <Clock className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={outsideRef}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="bg-[white] p-0 w-auto [260px] gap-0 space-x-0 shadow-none border-gray-400"
      >
        <X
          className="bg-[var(--accent-2)] h-[16px] w-[16px] absolute top-0 right-0 translate-y-[-30%] translate-x-[30%] text-white [var(--accent-2)] cursor-pointer rounded-full"
          onClick={() => setOpen(false)}
          strokeWidth={2.5}
        />
        <div className="flex items-center justify-between !gap-0">
          <div className="py-4 flex flex-col items-center w-[86px] border-r border-gray-300">
            <Input
              type="number"
              min="1"
              max="12"
              value={hour}
              onChange={(e) => handleHourInput(e.target.value)}
              className="bg-[#F0F0F0] mb-2 w-[calc(100%-16px)] px-1 text-center text-sm border-gray-400 shadow-none"
              placeholder="HH"
            />
          </div>
          <div className="py-4 flex flex-col items-center w-[86px] border-r border-gray-300">
            <Input
              type="number"
              min="0"
              max="59"
              value={minute}
              onChange={(e) => handleMinuteInput(e.target.value)}
              className="bg-[#F0F0F0] mb-2 w-[calc(100%-16px)] px-1 text-center text-sm border-gray-400 shadow-none"
              placeholder="MM"
            />
          </div>
          <div className="flex flex-col justify-center items-center w-[76px] space-y-2">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  "px-3 py-1 rounded-md text-sm transition-colors duration-150",
                  period === p
                    ? "bg-black text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
