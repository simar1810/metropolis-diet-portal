"use client"
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { getPhysicalMemberships } from "@/lib/fetchers/app";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { getMembershipType } from "@/lib/formatter";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams()

  const { isLoading, error, data } = useSWR(
    `app/physical-club/memberships/${id}`,
    () => getPhysicalMemberships({
      person: "coach",
      clientId: id,
      populate: "client:name|mobileNumber|rollno|isPhysicalClubActive"
    })
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const [client] = data?.data?.results || [{}]

  const memberships = client.history

  return <div className="content-container content-height-screen">
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{client.client?.name}</h2>
          <p className="text-sm text-gray-600">
            Roll No: {client.client?.rollno} • {client.client?.mobileNumber}
          </p>
        </div>
        <Badge variant={client.isPhysicalClubActive ? "success" : "destructive"}>
          {client.isPhysicalClubActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    </div>

    <Table className="bg-[var(--comp-1)] mt-4 border-1">
      <TableHeader>
        <TableRow>
          <TableHead>Sr No.</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Membership Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Payment Mode</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership, idx) => <HistoryItem
          key={membership._id}
          idx={idx}
          membership={membership}
          current={client.current}
        />)}
      </TableBody>
    </Table>
  </div>
}

function HistoryItem({
  current,
  membership,
  idx
}) {
  return <TableRow key={membership._id || idx}>
    <TableCell>{idx + 1}</TableCell>
    <TableCell>
      {membership._id === current ? (
        <Badge variant="wz_fill">Active</Badge>
      ) : (
        <Badge variant="destructive">In Active</Badge>
      )}
    </TableCell>
    <TableCell>{membership.membershipType || "—"}</TableCell>
    <TableCell>
      {membership.membershipType === 2 ? (
        <span>{membership.servings ?? "—"} Pending Servings</span>
      ) : (
        <span>
          {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : "—"} →{" "}
          {membership.endDate ? new Date(membership.endDate).toLocaleDateString() : "—"}
        </span>
      )}
    </TableCell>
    <TableCell>{membership.paymentMode || "—"}</TableCell>
    <TableCell>{membership.amount ? `₹${membership.amount}` : "—"}</TableCell>
  </TableRow>
}