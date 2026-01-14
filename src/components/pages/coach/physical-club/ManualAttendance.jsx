"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { dateWiseAttendanceSplit, getPresentAbsent, manualAttendanceGroupClients, manualAttendanceWithRange, manualAttendanceWithRangeMultiple } from "@/lib/physical-attendance";
import { nameInitials } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { CheckCircle, X, Trash2, Plus, ChevronDown } from "lucide-react";
import { CustomCalendar } from "@/components/common/CustomCalender";
import ChangeClientAttendanceStatus from "./ChangeClientAttendanceStatus";
import { endOfMonth, format, startOfMonth } from "date-fns";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AddNewServing from "./AddNewServing";

export default function ManualAttendance({
  data,
  query,
  range,
  setRange
}) {
  const clients = manualAttendanceWithRangeMultiple(data, range)
    .filter(client => new RegExp(query, "i").test(client?.name))

  return (<TabsContent value="manual-attendance" className="flex flex-wrap gap-6">
    <AttendanceClients clients={clients} originalData={data} range={range} />
    <div className="flex-1">
      <AttendanceCalendar
        range={range}
        data={data}
        setRange={setRange}
      />
      <AttendanceSummary data={data} clients={clients} />
    </div>
  </TabsContent>
  );
}

export function AttendanceClients({ clients, range }) {
  const groupedClientList = manualAttendanceGroupClients(clients)

  return (
    <div className="flex-1 space-y-2 bg-[var(--comp-1)] border-1 p-2 rounded-[8px]">
      <div className="mb-4 text-lg font-semibold">
        Total Records <span className="text-gray-500 text-sm">({clients.length})</span>
      </div>
      {groupedClientList.map(client => <ClientDetails
        date={range.from}
        key={client.clientId}
        client={client}
      />)}
    </div>
  );
}

function ClientDetails({ client, date }) {
  return <div key={client.clientId}
    className="bg-white px-4 py-3 border-1"
  >
    <Collapsible
      defaultOpen
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="font-bold">{client.name}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-700 font-bold">Servings - {client.history.length}</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 px-2">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-gray-50 border-1 p-2 mt-2 rounded-[4px] space-y-2">
          {client
            .history
            .map((attendance, index) => (
              <div
                key={index}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <span className="text-sm text-gray-700 font-bold min-w-[2ch] md:min-w-[4ch]">{index + 1}</span>
                <span className="text-sm text-gray-700 font-bold mr-auto">
                  {format(new Date(attendance.date), "dd-MM-yyyy")}&nbsp;
                  <span className="italic text-[12px] font-bold md:mr-auto">#{attendance.servingNumber}</span>
                </span>
                <ClientAttendanceActions
                  clientId={client.clientId}
                  attendance={attendance}
                />
              </div>
            ))}
          {client
            .history.length === 0 && <div
              className="h-10 flex items-center justify-center border-dashed text-sm text-gray-700 font-bold"
            >
              No attendance found
            </div>}
        </div>
        <AddNewServing key={`${client.clientId}-${date}`} date={date} clientId={client.clientId} />
      </CollapsibleContent>
    </Collapsible>
  </div>
}

function ClientAttendanceActions({ clientId, attendance }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      <ChangeClientAttendanceStatus
        status="present"
        date={attendance.date}
        clientId={clientId}
        servingNumber={attendance.servingNumber}
      >
        <button
          className={cn(
            `flex items-center gap-2 px-2 h-6 py-1 text-xs font-bold rounded-[4px] border-1 border-[var(--accent-1)]
                              text-[var(--accent-1)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-100`,
            attendance.status === "present" ? "!opacity-100 bg-[var(--accent-1)] text-white" : "opacity-40"
          )}
          disabled={attendance.status === "present"}
        >
          <CheckCircle className="w-[14px] h-[14px]" />
          Present
        </button>
      </ChangeClientAttendanceStatus>
      <ChangeClientAttendanceStatus
        clientId={clientId}
        status="absent"
        date={attendance.date}
        servingNumber={attendance.servingNumber}
      >
        <button className={cn(
          `flex items-center gap-2 px-2 h-6 py-1 text-xs font-bold rounded-[4px] border-1 border-[var(--accent-2)]
                              text-[var(--accent-2)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-100`,
          attendance.status === "absent" ? "!opacity-100 bg-[var(--accent-2)] text-white" : "opacity-40"
        )}
          disabled={attendance.status === "absent"}
        >
          <X className="w-[14px] h-[14px]" />
          Absent
        </button>
      </ChangeClientAttendanceStatus>
      {/* <ChangeClientAttendanceStatus
        status="requested"
        date={attendance.date}
        clientId={clientId}
        servingNumber={attendance.servingNumber}
      >
        <button className={cn(
          `flex items-center gap-2 px-2 h-6 py-1 text-xs font-bold rounded-[4px] border-1 border-black
                              text-black disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-100`,
          attendance.status === "requested" ? "!opacity-100 bg-black text-white" : "opacity-40"
        )}
          disabled={attendance.status === "requested"}
        >
          <Plus className="w-4 h-4" />
          Request
        </button>
      </ChangeClientAttendanceStatus> */}
    </div>
  )
}


export function AttendanceCalendar({
  data = [],
  range,
  setRange,
}) {
  const clients = manualAttendanceWithRangeMultiple(data, {
    from: startOfMonth(range.from),
    to: endOfMonth(range.from)
  })

  const badgeData = dateWiseAttendanceSplit(clients)
  return (
    <div className="w-full">
      <CustomCalendar
        range={range}
        badgeData={badgeData}
        onRangeSelect={setRange}
        mode="single"
      />
    </div>
  );
}

export function AttendanceSummary({
  data = []
}) {
  return <></>
  const { absent, present, requested } = getPresentAbsent(data)
  return (
    <Card className="mt-4 p-4 gap-0 bg-[var(--comp-1)] shadow-none">
      <div className="pb-2 mb-4 border-b-2 border-[var(--accent-1)] flex items-center justify-between">
        <h2>Attendance Summary</h2>
        {/* <div className="text-sm text-gray-600 mb-2">16 September, 2025</div> */}
      </div>
      <div className="grid grid-cols-2 divide-x-2">
        <div className="flex justify-between text-sm pr-4">
          <span>Total Clients:</span>
          <span className="font-semibold">{data.length}</span>
        </div>
        <div className="pl-4">
          <div className="flex justify-between text-sm text-green-600">
            <span>Present Clients:</span>
            <span className="font-semibold">{present}</span>
          </div>
          <div className="flex justify-between text-sm text-red-600">
            <span>Absent Clients:</span>
            <span className="font-semibold">{absent}</span>
          </div>
          <div className="flex justify-between text-sm text-[#808080]">
            <span>Requested Clients:</span>
            <span className="font-semibold">{requested}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function NotOfUse() {
  return <div className="space-y-3">
    {Object.values(groupedClients).map((group, i) => (
      <div key={i} className="border-b pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={group.profilePhoto} />
              <AvatarFallback>{nameInitials(group.name)}</AvatarFallback>
            </Avatar>
            <Link href={`/coach/clients/${group.clientId}?tab=physical-club`}>{group.name}</Link>
            <span className="text-[12px] mt-1">{format(group.date, "dd-MM-yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Always show Absent button */}
            <ChangeClientAttendanceStatus
              date={group.date}
              clientId={group.clientId}
              status="absent"
            >
              <Button
                size="sm"
                variant="outline"
                className="rounded-full font-bold hover:text-[var(--accent-2)] text-[var(--accent-2)] border-[var(--accent-2)] hover:border-[var(--accent-2)]"
              >
                <X className="bg-[var(--accent-2)] text-white rounded-full p-[2px]" />
                Absent
              </Button>
            </ChangeClientAttendanceStatus>

            {/* Show Present/Add Servings button based on status - prioritize present over absent */}
            {group.servings.some(s => s.status === "present") ? (
              // If present, show Add Servings button
              <ChangeClientAttendanceStatus
                clientId={group.clientId}
                date={group.date}
                status="present"
                isFirstRecord={false}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full font-bold hover:text-[var(--accent-1)] text-[var(--accent-1)] border-[var(--accent-1)] hover:border-[var(--accent-1)]"
                >
                  <Plus className="h-4 w-4" />
                  Add Servings
                </Button>
              </ChangeClientAttendanceStatus>
            ) : (
              // If not present (absent or no attendance), show Present button
              <ChangeClientAttendanceStatus
                clientId={group.clientId}
                date={group.date}
                status="present"
                isFirstRecord={true}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full font-bold hover:text-[var(--accent-1)] text-[var(--accent-1)] border-[var(--accent-1)] hover:border-[var(--accent-1)]"
                >
                  <CheckCircle className="text-[var(--accent-1)]" />
                  Present
                </Button>
              </ChangeClientAttendanceStatus>
            )}

            {/* Show Remove buttons only if present and has multiple servings */}
            {group.servings.some(s => s.status === "present") && group.servings.filter(s => s.status === "present").length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full font-bold hover:text-red-600 text-red-600 border-red-600 hover:border-red-600"
                  onClick={() => {
                    // Remove one present serving from the total count
                    const presentServings = group.servings.filter(s => s.status === "present");
                    if (presentServings.length > 1) {
                      // Find the serving with the highest serving number to remove
                      const sortedServings = presentServings.sort((a, b) => (b.servingNumber || 0) - (a.servingNumber || 0));
                      const servingToRemove = sortedServings[0]; // Get the serving with highest number
                      unmarkServing(group.clientId, servingToRemove.date, servingToRemove.servingNumber || presentServings.length);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Serving
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full font-bold hover:text-red-700 text-red-700 border-red-700 hover:border-red-700"
                  onClick={() => {
                    // Remove all present servings for this day
                    const presentServings = group.servings.filter(s => s.status === "present");
                    presentServings.forEach((serving, index) => {
                      setTimeout(() => {
                        unmarkServing(group.clientId, serving.date, serving.servingNumber || index + 1);
                      }, index * 200); // Stagger the requests
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove All ({group.servings.filter(s => s.status === "present").length})
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Show simple count of servings based on status */}
        <div className="ml-12">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">
              {group.servings.some(s => s.status === "present") ? (
                <span className="font-medium text-green-600">
                  {group.servings.filter(s => s.status === "present").length} Serving{group.servings.filter(s => s.status === "present").length > 1 ? 's' : ''}
                </span>
              ) : group.servings.some(s => s.status === "absent") ? (
                <span className="font-medium text-red-600">
                  Absent
                </span>
              ) : (
                <span className="font-medium text-gray-500">
                  No attendance marked
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    ))}
    {clients.length === 0 && <div className="bg-white border-1 rounded-[6px] h-[200px] flex items-center justify-center font-bold">
      No Matches Found!
    </div>}
  </div>
}