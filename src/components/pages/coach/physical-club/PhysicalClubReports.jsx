"use client"
import { TabsContent } from "@/components/ui/tabs"
import { generateAttendanceRows, physicalClubReportsMonthly, physicalClubReportsYearly } from "@/lib/physical-attendance"
import { BarChartComponent } from "@/components/common/charts/Barchart"
import { endOfMonth, endOfYear, getMonth, getYear, startOfMonth, startOfYear } from "date-fns"
import { MONTHS } from "@/config/data/date"
import { useState } from "react"
import MonthYearPicker from "@/components/common/MonthYearPicker"
import { CustomCalendar } from "@/components/common/CustomCalender"
import YearPicker from "@/components/common/YearPicker"


export default function PhysicalClubReports({
  data,
  range
}) {

  return (
    <TabsContent value="reports" className="border-1 shadow-none rounded-[10px]">
      <div className="bg-[var(--comp-1)] p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <MonthlyCalender allData={data} />
        <YearlyCalender allData={data} />
      </div>
    </TabsContent>
  )
}


function MonthlyCalender({ allData }) {
  const [range, setRange] = useState({
    month: getMonth(new Date()),
    year: getYear(new Date())
  })
  const dataInRange = {
    from: startOfMonth(new Date(range.year, range.month, 15)),
    to: endOfMonth(new Date(range.year, range.month, 15)),
  }

  const data = (physicalClubReportsMonthly(allData, dataInRange) || [])

  return <div className="bg-white">
    <div className="py-4 px-4 flex items-center justify-between gap-4 border-1 border-b-0 rounded-t-xl">
      <h2>Select Month</h2>
      <MonthYearPicker
        month={range.month}
        year={range.year}
        setRange={setRange}
      />
    </div>
    <BarChartComponent
      xAxis={{
        XAxisDataKey: data.XAxisDataKey,
        data: data.data
      }}
      yAxis={{
        YAxisDataKey: data.YAxisDataKey,
        YAxisDataLabel: "Shakes"
      }}
      chartConfig={{
        title: `Monthly Data for ${MONTHS[range.month]}`,
        description: "",
        label1: "",
        label2: ""
      }}
      className="bg-white !rounded-t-none"
    />
  </div>
}



function YearlyCalender({ allData }) {
  const [range, setRange] = useState({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  })

  const data = (physicalClubReportsYearly(allData, range) || [])

  return <div className="bg-white">
    <div className="py-4 px-4 flex items-center justify-between gap-4 border-1 border-b-0 rounded-t-xl">
      <h2>Select Year</h2>
      <YearPicker
        value={getYear(range.from)}
        onChange={value => setRange({
          from: startOfYear(new Date(value, 6, 15)),
          to: endOfYear(new Date(value, 6, 15)),
        })}
      />
    </div>
    <BarChartComponent
      xAxis={{
        XAxisDataKey: data.XAxisDataKey,
        data: data.data
      }}
      yAxis={{
        YAxisDataKey: data.YAxisDataKey,
        YAxisDataLabel: "Shakes"
      }}
      chartConfig={{
        title: `Yearly Data for ${getYear(range.from)}`,
        description: "",
        label1: "",
        label2: ""
      }}
      className="bg-white !rounded-t-none"
    />
  </div>
}