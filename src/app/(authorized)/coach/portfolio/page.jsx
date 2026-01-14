"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import CoachData from "@/components/pages/coach/portfolio/CoachData";
import CoachDetailsCard from "@/components/pages/coach/portfolio/CoachDetailsCard";
import { getCoachProfile } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import useSWR from "swr";

export default function Page() {
  const _id = useAppSelector(state => state.coach.data._id);

  const { isLoading, error, data } = useSWR("coachProfile", () => getCoachProfile(_id));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const coachData = data.data;

  return <div className="mt-4 grid md:grid-cols-2 items-start gap-4">
    <CoachDetailsCard coachData={coachData} />
    <CoachData awards={coachData.awards} />
  </div>
}