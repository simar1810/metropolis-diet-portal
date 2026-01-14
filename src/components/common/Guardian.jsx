"use client"
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks"
import { useEffect } from "react";
import useSWR, { mutate, useSWRConfig } from "swr";
import { getCoachProfile } from "@/lib/fetchers/app";
import { destroy, store } from "@/providers/global/slices/coach";
import Loader from "./Loader";
import ContentError from "./ContentError";
import { TriangleAlert } from "lucide-react";
import { subscriptionDaysRemaining } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";

async function logout() {
  await fetch("/api/logout", { method: "DELETE" });
}

export default function Guardian({
  children,
  _id
}) {
  const { isLoading, data } = useSWR("coachProfile", () => getCoachProfile(_id))
  const { cache } = useSWRConfig();

  const dispatchRedux = useAppDispatch();
  const coach = useAppSelector(state => state.coach.data);
  useEffect(function () {
    (async function () {
      if (data && data.status_code === 200) {
        dispatchRedux(store(data.data))
      } else if (data?.status_code === 401) {
        dispatchRedux(destroy());
        await fetch("/api/logout", { method: "DELETE" });
        window.location.href = "/login";
      };
    }
    )();
  }, [isLoading]);

  if (data?.status_code === 401) {
    for (const [field] of cache.entries()) {
      if (field !== "coachProfile") cache.delete(field)
    }
    return <></>
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">
    <Loader />
  </div>

  if (data?.status_code !== 200 || !coach) return <div className="h-screen text-[var(--accent-2)] flex flex-col gap-0 items-center justify-center font-bold text-[32px]">
    <TriangleAlert className="w-[64px] h-[64px]" />
    <ContentError
      className="min-h-auto border-0 mt-0 p-0"
      title={data?.message || "Please Wait"}
    />
  </div>

  const subscription = data.data.subscription;
  const subscriptionStatus = subscriptionDaysRemaining(subscription?.planCode, subscription?.endDate)

  if (!subscriptionStatus?.success) {
    return <div className="h-screen flex flex-col gap-0 items-center justify-center text-center">
      <ContentError
        className="max-w-[40ch] min-h-auto border-0 mt-0 p-0"
        title={subscriptionStatus?.message}
      />
      <div className="mt-4 flex items-center justify-center gap-4">
        <Link
          href={`https://www.wellnessz.in/plans/${data.data._id}`}
          className="bg-[var(--accent-1)] px-4 py-3 rounded-[8px] text-white font-bold text-[14px]"
          target="_blank"
        >
          Upgrade
        </Link>
        <Button
          variant="destructive"
          onClick={() => {
            logout()
            location.reload()
          }}
        >
          Logout</Button>
      </div>
    </div >
  }

  return children;
}