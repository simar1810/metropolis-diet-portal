"use client"
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { retrieveClientNudges } from "@/lib/fetchers/app";
import { NotificationItem } from "@/components/pages/coach/client/ClientNudges";
import Paginate from "@/components/Paginate";
import { useState } from "react";
import ScheduleNotificationWrapper from "@/components/modals/client/ScheduleNotification";
import { useNotificationSchedulerCache } from "@/hooks/useNotificationSchedulerCache";

export default function Page() {
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    populate: "client"
  })
  const { isLoading, error, data } = useSWR(
    `client/nudges/${pagination.limit}/${pagination.page}`,
    () => retrieveClientNudges(false, pagination)
  );

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error?.message || data?.message} />

  const {
    results: notifications = [],
    totalPages,
    totalResults
  } = data?.data || {}

  return <div className="content-container content-height-screen">
    <div className="flex items-center justify-between">
      <h4>Notifications</h4>
      <ScheduleNotificationWrapper />
    </div>
    {notifications.length === 0
      ? <div className="h-80 items-center justify-center flex font-semibold">
        No Notification found
      </div>
      : <>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {notifications.map(notification => <NotificationItem
            key={notification._id}
            item={notification}
          />)}
        </div>
        <Paginate
          totalPages={totalPages}
          totalResults={totalResults}
          limit={pagination.limit}
          page={pagination.page}
          onChange={setPagination}
        />
      </>
    }
  </div>
}