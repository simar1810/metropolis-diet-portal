"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getYear } from "date-fns"

export default function YearPicker({
  value,
  onChange,
  startYear = 2015,
  endYear = getYear(new Date()),
  label
}) {
  const years = []
  for (let y = endYear; y >= startYear; y--) {
    years.push(y)
  }

  const [selectedYear, setSelectedYear] = useState(value || endYear)

  const handleChange = (year) => {
    setSelectedYear(year)
    onChange?.(parseInt(year))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor="year">{label}</Label>}
      <Select value={selectedYear.toString()} onValueChange={handleChange}>
        <SelectTrigger id="year" className="w-40 md:w-[180px] bg-[var(--accent-1)] text-white font-bold">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
