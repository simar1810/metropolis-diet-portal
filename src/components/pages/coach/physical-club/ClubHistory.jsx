"use client"

import { Card } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { getMembershipType, nameInitials } from "@/lib/formatter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { clubHistory } from "@/lib/physical-attendance"

function TableHeader() {
  return (
    <thead>
      <tr className="text-sm text-gray-500">
        <th className="px-4 py-2 text-center">Sr No.</th>
        <th className="px-4 py-2 text-center">Client Name</th>
        <th className="px-4 py-2 text-center">Client Status</th>
        {/* <th className="px-4 py-2 text-center">Start Date</th> */}
        <th className="px-4 py-2 text-center">Servings Served</th>
        <th className="px-4 py-2 text-center">Pending Servings /<br /> End Date</th>
        <th className="px-4 py-2 text-center">Completion Percentage</th>
      </tr>
    </thead>
  )
}

function TableRow({
  client,
  index
}) {
  const getStatusClass = (status) =>
    status
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-600"

  const getPercentageClass = (percent = 10) => {
    if (percent >= 75) return "text-green-600"
    if (percent >= 45) return "text-yellow-600"
    return "text-red-600"
  }

  const getBadgeClass = (label = "Low") => {
    switch (label) {
      case "High":
        return "bg-green-100 text-green-700"
      case "Moderate":
        return "bg-orange-100 text-orange-600"
      case "Low":
        return "bg-yellow-100 text-yellow-600"
      case "Very Low":
        return "bg-red-100 text-red-600"
      default:
        return "bg-purple-500"
    }
  }
  const { end } = getMembershipType({
    membershipType: client.membershipType,
    endDate: client.endDate,
    servings: client.pendingServings,
  } || {})

  return (
    <tr className="text-sm [&_td]:text-center">
      <td className="px-4 py-2">{index}</td>
      <td className="px-4 py-2 flex items-center gap-2">
        <Avatar>
          <AvatarImage src={client.profilePhoto} />
          <AvatarFallback>{nameInitials(client.clientName)}</AvatarFallback>
        </Avatar>
        {client.clientName}
      </td>
      <td className="px-4 py-2">
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusClass(client.clientStatus)}`}>
          {client.clientStatus
            ? <>Active</>
            : <>In Active</>}
        </span>
      </td>
      {/* <td className="px-4 py-2">{client.presentDays || 0} Days</td> */}
      <td className="px-4 py-2">{client.presentDays || 0}</td>
      <td className="text-center">{end}</td>
      <td className="px-4 py-2 flex items-center gap-2">
        <span className={`font-medium ${getPercentageClass(client.showupPercentage)}`}>
          {client.completionPercentage}%
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${getBadgeClass(client.showupLabel)}`}>
          {client.showupLabel || <>Very Low</>}
        </span>
      </td>
    </tr>
  )
}

export default function ClubHistoryPage({
  query,
  range,
  data
}) {
  const clients = clubHistory(data || [], range)
    .filter(client => new RegExp(query, "i").test(client?.clientName))
  return (
    <TabsContent value="club-history">
      <Card className="p-0 shadow-none border-1 rounded-[10px] bg-[var(--comp-1)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <TableHeader />
            <tbody>
              {clients.map((client, idx) => (
                <TableRow
                  key={idx}
                  client={client}
                  index={idx + 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && <div className="bg-white m-4 border-1 rounded-[6px] h-[200px] flex items-center justify-center font-bold">
          No Matches Found!
        </div>}
      </Card>
    </TabsContent>
  )
}
