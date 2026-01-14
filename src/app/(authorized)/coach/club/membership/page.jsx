"use client";
import SubscriptionModeClientList from "@/components/pages/coach/club/memberships/SubscriptionModeClientList";
import VolumePointModeClientsList from "@/components/pages/coach/club/memberships/VolumePointModeClientsList";
import { useAppSelector } from "@/providers/global/hooks";

export default function Page() {
  const clubSystem = useAppSelector(state => state.coach.data?.clubSystem)
  if ([0, 1].includes(clubSystem)) return <SubscriptionModeClientList />

  if (clubSystem === 2) return <VolumePointModeClientsList />
}