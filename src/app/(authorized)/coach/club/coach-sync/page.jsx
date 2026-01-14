"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { getSyncCoachesList } from "@/lib/fetchers/app";
import useSWR from "swr";
import SyncCoachModal from "@/components/modals/tools/SyncCoachModal";
import SyncedCoachesModal from "@/components/modals/coach/SyncedCoachesModal";

const CoachSyncStatus = { 1: "request", 2: "synced" }

export default function Page() {
  const { isLoading, error, data } = useSWR("app/sync-coach/super", getSyncCoachesList);

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const syncedCoaches = data.data;
  const { request = [], synced = [] } = Object.groupBy(syncedCoaches, coach => CoachSyncStatus[coach.status])

  return <div className="content-container">
    <SyncedCoaches data={synced} />
    <RequestedCoaches data={request} />
  </div>
}

function SyncedCoaches({ data }) {
  return <div>
    <h4 className="mb-4">Synced Coaches</h4>
    {data.length === 0 && <ContentError
      title="0 Synced Coaches!"
      className="bg-[var(--comp-1)] mt-0 !min-h-[100px] border-0"
    />}
    {data.length > 0 &&
      <Table className="bordered-table [&_th]:font-bold [&_th]:text-center">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Sr. No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Coach ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => <TableRow
            key={index}
          >
            <TableCell className="w-[100px]">{index + 1}</TableCell>
            <TableCell>{record?.coach?.name}</TableCell>
            <TableCell>{record?.coach?.mobileNumber}</TableCell>
            <TableCell>{record?.coach?.coachId}</TableCell>
            <TableCell>{CoachSyncStatus[record.status]}</TableCell>
            <TableCell className="flex items-center justify-center gap-4">
              <SyncCoachModal coachId={record.coach._id} defaultValue={record.status} />
              <SyncedCoachesModal coachId={record.coach._id} />
            </TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    }
  </div>
}

function RequestedCoaches({ data }) {
  return <div className="mt-10">
    <h4 className="mb-4">Coach Requests</h4>
    {data.length === 0 && <ContentError
      title="No Requests!"
      className="bg-[var(--comp-1)] mt-0 !min-h-[100px] border-0"
    />}
    {data.length > 0 && <Table className="bordered-table [&_th]:font-bold [&_th]:text-center">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Sr. No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Mobile Number</TableHead>
          <TableHead>Coach ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record, index) => <TableRow
          key={index}
        >
          <TableCell className="w-[100px]">{index + 1}</TableCell>
          <TableCell>{record?.coach?.name}</TableCell>
          <TableCell>{record?.coach?.mobileNumber}</TableCell>
          <TableCell>{record?.coach?.coachId}</TableCell>
          <TableCell>{CoachSyncStatus[record.status]}</TableCell>
          <TableCell>
            <SyncCoachModal coachId={record.coach._id} defaultValue={record.status} />
          </TableCell>
        </TableRow>)}
      </TableBody>
    </Table>}
  </div>
}