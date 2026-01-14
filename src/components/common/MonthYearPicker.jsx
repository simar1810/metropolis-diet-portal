"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MONTHS } from "@/config/data/date";
import { CalendarRange } from "lucide-react";

export default function MonthYearPicker({
  month,
  year,
  setRange,
}) {

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-40 md:w-[200px] bg-[var(--accent-1)] text-white font-bold justify-center">
          <CalendarRange /> {MONTHS[parseInt(month)]} {year}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3 space-y-2">
        <div className="flex items-center gap-4">
          <Select
            defaultValue={MONTHS[month].slice(0, 3)}
            onValueChange={(m) => setRange({ month: m, year })}
          >
            <SelectTrigger className="!bg-white">
              <SelectValue placeholder="Select month">
                {MONTHS[month].slice(0, 3)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m.slice(0, 3)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            defaultValue={year}
            onValueChange={(y) => setRange({ month, year: y })}
          >
            <SelectTrigger className="!bg-white">
              <SelectValue placeholder="Select year">
                {year}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
