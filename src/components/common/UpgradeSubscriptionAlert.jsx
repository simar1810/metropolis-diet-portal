"use client";
import { useAppSelector } from "@/providers/global/hooks";
import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

export default function UpgradeSubscriptionAlert() {
  const { subscription, _id } = useAppSelector(state => state.coach.data)

  if (!subscription.alertShown) return <></>;

  return <div className="p-[10px] flex items-center gap-4 border-2 border-[var(--accent-1)] rounded-[10px]">
    <div className="h-full p-2 bg-[var(--accent-1)]/25 rounded-[4px]">
      <TriangleAlertIcon className="w-[32px] text-[var(--accent-1)] aspect-square" />
    </div>
    <div>
      <h4 className="text-[14px]">{subscription.pendingDays} Days Left In {subscription.planType}</h4>
      <p className="text-[var(--dark-2)] text-[10px]">Your subscription will end in {subscription.pendingDays} days. Please renew your subscription.</p>
    </div>
    <Link
      href={`https://www.wellnessz.in/plans/${_id}`}
      target="_blanlk"
      className="bg-[var(--accent-1)] text-white text-[14px] leading-[1] font-bold px-6 py-[10px] ml-auto rounded-[8px]"
    >
      Upgrade Now
    </Link>
  </div>
}