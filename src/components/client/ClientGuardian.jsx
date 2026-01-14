"use client"
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks"
import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getClientProfile } from "@/lib/fetchers/app";
import Loader from "@/components/common/Loader";
import ContentError from "@/components/common/ContentError";
import { TriangleAlert } from "lucide-react";
import { destroyClient, storeClient } from "@/providers/global/slices/client";

export default function ClientGuardian({ children }) {
  const { isLoading, data } = useSWR("clientProfile", getClientProfile)
  const { cache } = useSWRConfig();

  const dispatchRedux = useAppDispatch();
  const client = useAppSelector(state => state.client.data);

  useEffect(function () {
    (async function () {
      if (data && data.status_code === 200) {
        dispatchRedux(storeClient(data.data))
      } else if (data?.status_code === 401) {
        dispatchRedux(destroyClient());
        await fetch("/api/logout", { method: "DELETE" });
        window.location.href = "/client/login";
      };
    }
    )();
  }, [isLoading]);

  if (data?.status_code === 401) {
    for (const [field] of cache.entries()) {
      if (field !== "clientProfile") cache.delete(field)
    }
    return <></>
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">
    <Loader />
  </div>

  if (data?.status_code !== 200 || !client) return <div className="h-screen text-[var(--accent-2)] flex flex-col gap-0 items-center justify-center font-bold text-[32px]">
    <TriangleAlert className="w-[64px] h-[64px]" />
    <ContentError
      className="min-h-auto border-0 mt-0 p-0"
      title={data?.message || "Please Wait"}
    />
  </div>

  return children;
}