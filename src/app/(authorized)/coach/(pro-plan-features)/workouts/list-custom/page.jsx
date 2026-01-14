"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import AssignWorkoutModal from "@/components/modals/AssignModal";
import { Badge } from "@/components/ui/badge";
import { getCustomWorkoutPlans } from "@/lib/fetchers/app";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("custom-workout-plans", () => getCustomWorkoutPlans("coach"));
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  if (isLoading) return <ContentLoader />
  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const workouts = ["daily", "monthly", "weekly"].includes(mode)
    ? data.data.filter(workout => workout.mode === mode)
    : data.data

  return <main className="content-container content-height-screen">
    <div className="flex items-center justify-between">
      <h4>Custom Workouts</h4>
      {mode && <Link
        className="px-4 py-2 rounded-[10px] bg-[var(--accent-1)] text-white font-bold leading-[1] text-[14px]"
        href={`/coach/workouts/add/${mode}`}
      >
        Add
      </Link>}
    </div>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {workouts.map(workout => <div
        key={workout._id}
        className="bg-[var(--comp-2)] flex flex-col rounded-[12px] border-1 overflow-clip relative"
      >
        <Link href={`/coach/workouts/list-custom/${workout._id}`}>
          <Image
            src={workout.image?.trim() || "/not-found.png"}
            alt=""
            height={200}
            width={200}
            className="w-full max-h-[140px] object-cover border-b-1"
            onError={e => e.target.src = "/not-found.png"}
          />
        </Link>
        <div className="grow p-3 flex flex-col">
          <Link href={`/coach/workouts/list-custom/${workout._id}`}>
            <h3>{workout.title}</h3>
          </Link>
          <div className="mt-auto pt-2 flex items-center justify-between">
            <Badge className="capitalize">{workout.mode}</Badge>
            <AssignWorkoutModal
              type="custom"
              workoutId={workout._id}
            />
            {/* <AssignMealModal planId={workout._id} type="custom" /> */}
          </div>
        </div>
        {workout.admin && <Badge
          variant="wz"
          className="text-[10px] font-bold absolute top-2 right-2"
        >
          Admin
        </Badge>}
      </div>)}
    </div>
    {(workouts.length === 0) && <ContentError title="No Workouts Found!" className="font-bold mt-0 border-0" />}
  </main>
}