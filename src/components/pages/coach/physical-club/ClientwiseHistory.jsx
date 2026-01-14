import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { datesInRange, nameInitials } from "@/lib/formatter"
import { cn } from "@/lib/utils"
import { clientWiseHistory, clientWiseHistoryClientOptions, statusClases } from "@/lib/physical-attendance"
import { useMemo, useRef, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

function TableHeader({ days }) {
  return (
    <thead className="sticky top-0 bg-white z-20">
      <tr className="text-sm text-gray-500">
        <th className="px-4 py-2 text-left whitespace-nowrap sticky left-0 bg-white z-10">Sr No.</th>
        <th className="px-4 py-2 text-left sticky left-8 bg-white z-10">Client Name</th>
        {days.map((day) => (
          <th key={day.date} className="px-1 py-1 min-w-[50px]">
            <div className="text-center">
              <div className="font-medium text-sm">{day.date}</div>
              <div className="text-[10px] text-gray-400">{day.day}</div>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

function TableRow({
  index,
  client
}) {
  return (
    <tr className="text-sm">
      <td className="px-4 py-2 sticky left-0 bg-white z-10">{index}</td>
      <td className="whitespace-nowrap px-4 py-2 flex items-center gap-2 sticky left-8 bg-white z-10">
        <Avatar>
          <AvatarImage src={client.clientProfile} />
          <AvatarFallback>{nameInitials(client?.clientName)}</AvatarFallback>
        </Avatar>
        {client.clientName}
      </td>
      {client.attendanceInRange.map((day, i) => (
        <td key={i} className="px-1 py-1 min-w-[50px]">
          <div className="flex flex-col items-center gap-0.5">
            <div
              className={cn("w-5 h-5 mx-auto flex items-center justify-center rounded text-xs font-medium", 
                day.status ? statusClases(day.status) : "bg-gray-100 text-gray-400"
              )}
            >
              {day.status ? nameInitials(day.status) : <>-</>}
            </div>
          
          </div>
        </td>
      ))}
    </tr>
  )
}

export function ClientwiseHistory({
  query,
  data,
  range
}) {
  const [selectedClients, setSelectedClients] = useState([])
  const clientSet = new Set(selectedClients)

  const days = datesInRange(range)
  const result = (clientWiseHistory(
    data.filter(item => clientSet.has(item?.client?._id)),
    range
  ) || [])
    .filter(client => new RegExp(query, "i").test(client?.clientName))

  return (
    <TabsContent value="clientwise-history">
      <div className="w-fit ml-auto">
        <SelectClients
          clients={data}
          selectedClients={selectedClients}
          onSelectClients={setSelectedClients}
        />
      </div>
      <Card className="mt-4 p-0 shadow-none border-1 rounded-[10px] bg-[var(--comp-1)]">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="min-w-full border-collapse">
            <TableHeader days={days} />
            <tbody>
              {result.map((client, idx) => (
                <TableRow
                  key={idx}
                  index={idx + 1}
                  client={client}
                  days={days}
                />
              ))}
            </tbody>
          </table>
        </div>
        {result.length === 0 && <div
          className="bg-white m-4 border-1 rounded-[6px] h-[200px] flex items-center justify-center font-bold"
        >
          {clientSet.size === 0
            ? <>Please Select a Client</>
            : <>No Matches Found!</>}
        </div>}
      </Card>
    </TabsContent>
  )
}

function SelectClients({
  clients,
  selectedClients,
  onSelectClients
}) {
  const [selected, setSelected] = useState(selectedClients);
  const [searchQuery, setSearchQuery] = useState("");
  const dialogRef = useRef()

  const clientList = useMemo(() => clientWiseHistoryClientOptions(clients), [])
  
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clientList;
    return clientList.filter(client => 
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clientList, searchQuery]);

  return <Dialog>
    <DialogTrigger asChild>
      <Button className="font-bold">Select Clients</Button>
    </DialogTrigger>
    <DialogContent className="p-0 gap-0 max-h-[70vh] overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">Select Clients</DialogTitle>
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {filteredClients.map((client, idx) => (
            <label key={client.clientId} className="flex items-center gap-2 mb-4 cursor-pointer">
              <Avatar>
                <AvatarImage src={client.profilePhoto} />
                <AvatarFallback>{nameInitials(client?.clientName)}</AvatarFallback>
              </Avatar>
              <p htmlFor={client.clientId}
                className="mr-auto"
              >
                {client.clientName}
              </p>
              <input
                type="checkbox"
                id={client.clientId}
                checked={selected.includes(client.clientId)}
                value={client.clientId}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected(prev => [...prev, client.clientId])
                  } else {
                    setSelected(prev => prev.filter(id => id !== client.clientId))
                  }
                }}
              />
            </label>
          ))}
          {filteredClients.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No clients found matching "{searchQuery}"
            </div>
          )}
        </div>
        <Button
          onClick={() => {
            onSelectClients(selected);
            dialogRef.current?.click();
          }}
        >
          Save
        </Button>
      </div>
      <DialogClose ref={dialogRef} />
    </DialogContent>
  </Dialog>
}