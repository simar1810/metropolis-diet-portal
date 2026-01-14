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

export default function Page() {
  const { isLoading, error, data } = useSWR(
    "app/physical-club/memberships",
    () => getPhysicalMemberships({
      person: "coach",
      populate: "client:name|mobileNumber|rollno|isPhysicalClubActive"
    })
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const memberships = data?.data?.results || []

  if (memberships.length === 0) return <ContentError title="No membership found" />

  return <div className="content-container content-height-screen">
    <h4>Club Memberships</h4>
    <Table className="bg-[var(--comp-1)] mt-4 border-1">
      <TableHeader>
        <TableRow className="[&_th]:font-bold [&_th]:text-center">
          <TableHead>Sr No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Roll No</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Membership Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Pending Servings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership, index) => <MembershipItem
          key={membership._id}
          index={index}
          membership={membership}
        />)}
      </TableBody>
    </Table>
  </div>
}

function MembershipItem({ membership, index }) {
  const {
    type: membershipType,
    end: membershipEnd
  } = getMembershipType(membership)
  return <TableRow className="text-center" key={membership._id}>
    <TableCell>{index + 1}</TableCell>
    <TableCell>
      <Link
        href={`/coach/physical-club/memberships/${membership.client?._id}`}
        className="text-blue-600 hover:underline"
      >
        {membership.client?.name}
      </Link>
    </TableCell>
    <TableCell>{membership.client?.rollno}</TableCell>
    <TableCell>{membership.client?.mobileNumber}</TableCell>
    <TableCell>
      {membership.client?.isPhysicalClubActive
        ? <Badge variant="wz_fill">Active</Badge>
        : <Badge variant="destructive">In Active</Badge>}
    </TableCell>
    <TableCell>{membershipType || "—"}</TableCell>
    <TableCell>
      {membership.membershipType === 1
        ? membership.startDate ? new Date(membership.startDate).toLocaleDateString() : "—"
        : <>-</>}
    </TableCell>
    <TableCell>
      {membership.membershipType === 1
        ? membership.endDate ? new Date(membership.endDate).toLocaleDateString() : "—"
        : <>-</>}
    </TableCell>
    {membership.membershipType === 2
      ? <TableCell>{membership.pendingServings ?? "—"}</TableCell>
      : <TableCell>-</TableCell>}
  </TableRow>
}