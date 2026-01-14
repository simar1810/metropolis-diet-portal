"use client";
import ClientDataOwn from "@/components/client/profile/ClientDataOwn";
import ClientDetailsCardProfile from "@/components/client/profile/ClientDetailsCardProfile";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { getClientProfile } from "@/lib/fetchers/app";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("clientProfile", getClientProfile);
  if (isLoading) return <ContentLoader />
  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const clientData = data.data;
  clientData.weightLoss = data.weightLost;

  return <div className="mt-4 grid md:grid-cols-2 items-start gap-4">
    <ClientDetailsCardProfile clientData={clientData} />
    <ClientDataOwn clientData={clientData} />
  </div>
}