"use client"
import React, { useState, useMemo } from "react"
import useSWR from "swr"
import ContentLoader from "@/components/common/ContentLoader"
import ContentError from "@/components/common/ContentError"
import { getPhysicalAttendance } from "@/lib/fetchers/app"
import { useParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, isWithinInterval, parseISO, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X, Trash2 } from "lucide-react"
import { sendData } from "@/lib/api"
import { toast } from "sonner"
import { refreshAttendanceDataWithDelay } from "@/lib/attendanceUtils"

export default function Page() {
  const { id } = useParams()
  const { isLoading, error, data } = useSWR(
    `app/physical-club/attendance/${id}`,
    () =>
      getPhysicalAttendance({
        person: "coach",
        clientId: id,
        populate:
          "client:name|mobileNumber|rollno,membership:membershipType|pendingServings|endDate,attendance.meeting:meetingType|description|banner|allowed_client_type|topics|wellnessZLink",
      })
  )

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const [clientAttendance] = data?.data?.results || [{}]

  const attendances = clientAttendance.attendance || []

  const filteredAttendances = useMemo(() => {
    if (!startDate && !endDate) return attendances
    return attendances.filter((attendance) => {
      const date = parseISO(attendance.date)
      if (startDate && endDate) {
        return isWithinInterval(date, { start: startDate, end: endDate })
      }
      if (startDate) return date >= startDate
      if (endDate) return date <= endDate
      return true
    })
  }, [attendances, startDate, endDate])

  // Group attendances by date to show multiple servings per day
  const groupedAttendances = useMemo(() => {
    const grouped = {}
    filteredAttendances.forEach((attendance) => {
      try {
        const dateKey = format(parseISO(attendance.date), "yyyy-MM-dd")
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(attendance)
      } catch (error) {
        console.warn("Invalid date format:", attendance.date)
        // Skip invalid dates
      }
    })
    
    // Sort by date and then by serving number
    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, attendances]) => ({
        date,
        attendances: attendances.sort((a, b) => (a.servingNumber || 1) - (b.servingNumber || 1))
      }))
  }, [filteredAttendances])

  // Calculate statistics
  const statistics = useMemo(() => {
    const presentAttendances = filteredAttendances.filter(att => att.status === "present")
    const uniqueDays = new Set(presentAttendances.map(att => {
      try {
        return startOfDay(parseISO(att.date)).getTime()
      } catch (error) {
        console.warn("Invalid date for statistics:", att.date)
        return null
      }
    }).filter(Boolean)).size
    const totalServings = presentAttendances.length
    const unmarkedServings = filteredAttendances.filter(att => att.status === "unmarked").length

    return {
      uniqueDaysPresent: uniqueDays,
      totalServings,
      unmarkedServings,
      averageServingsPerDay: uniqueDays > 0 ? (totalServings / uniqueDays).toFixed(2) : 0
    }
  }, [filteredAttendances])

  const unmarkServing = async (date, servingNumber) => {
    try {
      // Instead of using the unmark API, use the regular attendance API to change status to "unmarked"
      const response = await sendData(
        "app/physical-club/attendance?person=coach",
        { 
          clientId: id, 
          date, 
          servingNumber, 
          status: "unmarked",
          person: "coach"
        },
        "PUT"
      )
      if (response.status_code !== 200) throw new Error(response.message)
      toast.success("Serving status changed to unmarked")
      // Refresh all attendance-related data with a small delay to ensure backend processing
      refreshAttendanceDataWithDelay(id)
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (isLoading) return <ContentLoader />
  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  if (!Boolean(clientAttendance)) return <ContentError title="No attendance found" />

  return (
    <div className="content-container content-height-screen">
      <h1 className="text-2xl font-semibold mb-6">
        Attendance for {clientAttendance.client?.name}
      </h1>

      <div className="flex items-center gap-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] justify-between font-normal"
            >
              <span className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd-MM-yyyy") : "Pick start date"}
              </span>
              {startDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation() // prevent popover from opening
                    setStartDate(null)
                  }}
                >
                  <X className="h-4 w-4 cursor-pointer text-muted-foreground" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] justify-between font-normal"
            >
              <span className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd-MM-yyyy") : "Pick end date"}
              </span>
              {endDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation() // prevent popover from opening
                    setEndDate(null)
                  }}
                >
                  <X className="h-4 w-4 cursor-pointer text-muted-foreground" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--comp-1)] p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Unique Days</h3>
          <p className="text-2xl font-bold">{statistics.uniqueDaysPresent}</p>
        </div>
        <div className="bg-[var(--comp-1)] p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Servings</h3>
          <p className="text-2xl font-bold">{statistics.totalServings}</p>
        </div>
        <div className="bg-[var(--comp-1)] p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Avg per Day</h3>
          <p className="text-2xl font-bold">{statistics.averageServingsPerDay}</p>
        </div>
        <div className="bg-[var(--comp-1)] p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Unmarked</h3>
          <p className="text-2xl font-bold text-orange-600">{statistics.unmarkedServings}</p>
        </div>
      </div>

      {/* Daily Status Summary */}
      <div className="bg-[var(--comp-1)] p-4 rounded-lg border mb-4">
        <h3 className="text-lg font-semibold mb-4">Daily Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedAttendances.map(({ date, attendances }) => {
            const presentCount = attendances.filter(att => att.status === "present").length
            const absentCount = attendances.filter(att => att.status === "absent").length
            const unmarkedCount = attendances.filter(att => att.status === "unmarked").length
            
            return (
              <div key={date} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{format(parseISO(attendances[0].date), "dd-MM-yyyy")}</h4>
                  <div className="flex gap-1">
                    {presentCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {presentCount} Present
                      </Badge>
                    )}
                    {absentCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {absentCount} Absent
                      </Badge>
                    )}
                    {unmarkedCount > 0 && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                        {unmarkedCount} Unmarked
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {presentCount > 0 && `${presentCount} serving${presentCount > 1 ? 's' : ''} consumed`}
                  {absentCount > 0 && ` • ${absentCount} absent`}
                  {unmarkedCount > 0 && ` • ${unmarkedCount} unmarked`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Attendance Table */}
      <Table className="bg-[var(--comp-1)] mt-4 border-1">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Daily Status</TableHead>
            <TableHead>Serving Details</TableHead>
            <TableHead>Marked At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedAttendances.length > 0 ? (
            groupedAttendances.map(({ date, attendances }) => (
              <React.Fragment key={date}>
                {attendances.map((attendance, index) => {
                  const presentCount = attendances.filter(att => att.status === "present").length
                  const absentCount = attendances.filter(att => att.status === "absent").length
                  const isFirstRow = index === 0
                  
                  return (
                    <TableRow key={`${date}-${attendance.servingNumber || index}`}>
                      <TableCell>
                        {isFirstRow && format(parseISO(attendance.date), "dd-MM-yyyy")}
                      </TableCell>
                      <TableCell>
                        {isFirstRow && (
                          <div className="flex flex-col gap-1">
                            {presentCount > 0 && (
                              <Badge variant="default" className="text-xs">
                                {presentCount} Present
                              </Badge>
                            )}
                            {absentCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {absentCount} Absent
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            #{attendance.servingNumber || 1}
                          </Badge>
                          <Badge 
                            variant={attendance.status === "present" ? "default" : 
                                    attendance.status === "absent" ? "destructive" : 
                                    attendance.status === "unmarked" ? "secondary" : "outline"}
                            className={attendance.status === "unmarked" ? "bg-orange-100 text-orange-700" : ""}
                          >
                            {attendance.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{attendance.markedAt ? format(parseISO(attendance.markedAt), "hh:mm a") : "—"}</TableCell>
                      <TableCell>
                        {attendance.status === "present" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unmarkServing(attendance.date, attendance.servingNumber || 1)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove Serving
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No attendance found in selected range
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
