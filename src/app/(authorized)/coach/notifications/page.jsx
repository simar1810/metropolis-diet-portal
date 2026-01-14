"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import ScheduleNotificationWrapper from "@/components/modals/client/ScheduleNotification";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getCoachNotifications } from "@/lib/fetchers/app";
import { Bell } from "lucide-react"
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const [page, setPage] = useState(0);

  const { isLoading, error, data } = useSWR("getCoachNotifications", getCoachNotifications);

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const notifications = data.data.slice(50 * page, 50 * (page + 1));

  function setNextPage(next) {
    if (next * 50 < data.data.length) setPage(next);
  }

  const types = new Set();
  let index = 0
  for (const notification of data.data) {
    index++;
    types.add(notification.notificationType)
  }

  if (notifications.length === 0) return <div>
    <div className="flex justify-end gap-2">
      <ScheduleNotificationWrapper />
      <Link
        href="/coach/notifications/manage-scheduled"
        className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-[8px] hover:rounded-[10px]"
      >Manage Notification</Link>
    </div>
    <ContentError title="No Notifications found" />
  </div>

  return <div className="content-container">
    <div className="flex items-center justify-between">
      <h4 className="pb-4 mb-4 border-b-1">Notifications</h4>
      <ScheduleNotificationWrapper />
    </div>
    <div className="grid grid-cols-2 gap-x-4">
      {notifications.map(notification => <Notification
        notification={notification}
        key={notification._id}
      />)}
    </div>
    <NotificationPagination
      page={page}
      setPage={setPage}
      setNextPage={setNextPage}
    />
  </div>
}

function Notification({ notification }) {
  return <div className="max-w-[96ch] px-4 py-3 mb-3 flex items-center gap-6 border-1 border-[var(--accent-1)] rounded-[10px]">
    <Bell fill="#00984A" className="min-w-[52px] h-[52px] bg-[#90C844]/30 text-[var(--accent-1)] p-3 rounded-full" />
    <div>
      <h4>{notification.message}</h4>
      <div className="mt-2 text-[var(--dark-1)]/25 leading-[1.2] text-[13px] font-semibold flex gap-4">
        <p>{notification.createdDate.slice(0, 10)}</p>
        <p>{notification.createdDate.slice(11)}</p>
      </div>
    </div>
  </div>
}

function NotificationPagination({
  page,
  setPage,
  setNextPage
}) {
  return <Pagination>
    <PaginationContent>
      {page > 0 && <PaginationItem onClick={() => setPage(page - 1)}>
        <PaginationPrevious />
      </PaginationItem>}
      <PaginationItem>
        <PaginationLink>{page + 1}</PaginationLink>
      </PaginationItem>
      <PaginationItem onClick={() => setNextPage(page + 1)}>
        <PaginationNext />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
}