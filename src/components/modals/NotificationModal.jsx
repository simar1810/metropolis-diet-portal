"use client";
import { Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import useSWR from "swr";
import ContentError from "../common/ContentError";
import { getCoachNotifications } from "@/lib/fetchers/app";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateUserToFeature__notification } from "@/lib/utils";
import { format, parse } from "date-fns";

export default function NotificationModal() {
  return <DropdownMenu>
    <DropdownMenuTrigger>
      <Bell fill="#00984A" className="w-[20px] h-[20px] text-[var(--accent-1)]" />
    </DropdownMenuTrigger>
    <DropdownMenuContent className="!max-w-[450px] max-h-[500px] p-0 overflow-auto border">
      <DropDownContainer />
    </DropdownMenuContent>
  </DropdownMenu>
}

function DropDownContainer() {
  const { isLoading, error, data } = useSWR("getCoachNotifications", getCoachNotifications);

  if (isLoading) return <Bell
    fill="#00984A"
    className="w-[20px] h-[20px] text-[var(--accent-1)] animate-pulse opacity-10"
  />

  const notifications = data.data.slice(0, 8)
  return <>
    {(error || data.status_code !== 200)
      ? <>
        <div className="py-6 h-[56px]">
          <h3 className="text-black text-[14px] ml-4">
            Error
          </h3>
        </div>
        <ContentError title={error || data.message} className="!min-h-[200px] !mt-0 border-0" />
      </>
      : <>
        <div className="pr-4 py-6 h-[56px] flex items-center justify-between">
          <h3 className="text-black text-[14px] ml-4">
            Notifications
          </h3>
          <Link href="/coach/notifications" className="text-[14px] text-[var(--accent-1)] underline">See All</Link>
        </div>
        <div className="px-4 py-3 divide-y-1">
          {notifications.map(notification => <Notification
            notification={notification}
            key={notification._id}
          />)}
        </div>
      </>}
  </>
}

function Notification({ notification }) {
  const formatted = format(parse(notification.createdDate, 'dd-MM-yyyy HH:mm', new Date()), 'dd-MM-yyyy hh:mm a');
  return <Link
    href={navigateUserToFeature__notification(notification.notificationType)}
    className="max-w-[96ch] min-w-[60ch] pb-2 mb-3 flex items-start gap-2 cursor-pointer"
  >
    <Bell fill="#00984A" className="min-w-[32px] h-[32px] bg-[#90C844]/30 text-[var(--accent-1)] p-[6px] rounded-full" />
    <div>
      <h4 className="!text-[12px]">{notification.message}</h4>
      <div className="mt-2 text-[var(--dark-1)]/25 leading-[1.2] text-[8px] font-semibold flex gap-4">
        <p>{formatted}</p>
      </div>
    </div>
  </Link>
}