'use client';
import { Filter } from "lucide-react";
import Image from "next/image";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { getWorkoutDetails } from "@/lib/fetchers/app";
import useSWR from "swr";
import AssignWorkoutModal from "@/components/modals/AssignModal";
import CreateWorkoutModal from "@/components/modals/tools/CreateWorkoutModal";
import Link from "next/link";
import { useState } from "react";
import FormControl from "@/components/FormControl";
import { useAppSelector } from "@/providers/global/hooks";

export default function Page() {
  const { _id } = useAppSelector(state => state.client.data)
  const [searchQuery, setSearchQuery] = useState("")
  const { isLoading, error, data } = useSWR("app/client/workoutCollections", () => getWorkoutDetails(undefined, "client"));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  return (
    <main className="content-container content-height-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <WorkoutsContainer
          allWorkouts={data.data}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}

function FilterOptions() {
  return <div className="flex items-center gap-3 mb-6 overflow-x-auto">
    <div className="flex items-center gap-2 px-4 py-2 text-green-600 border-[1.5px] border-[var(--accent-1)] rounded-full text-sm">
      <Filter className="w-4 h-4" />
      Filter
    </div>

    <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-[var(--accent-1)] text-white">
      Cardio
    </div>
    <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-500 bg-gray-100">
      Shoulder
    </div>
    <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-500 bg-gray-100">
      Light Weight
    </div>
  </div>
}

function Header({
  searchQuery,
  setSearchQuery
}) {
  return <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
    <h1 className="text-2xl font-semibold">Workout Library</h1>
    <FormControl
      className="w-full lg:min-w-[280px] md:max-w-[500px] [&_.input]:focus:shadow-2xl [&_.input]:bg-[var(--comp-1)] text-[12px] md:ml-auto"
      placeholder="Search Meal.."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
  </div>
}

function WorkoutsContainer({
  allWorkouts,
  searchQuery
}) {
  const workouts = allWorkouts.filter(workout => new RegExp(searchQuery, "i").test(workout.title));;
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
    {workouts.map(workout => <div key={workout._id} className="overflow-hidden bg-white">
      <div className="relative">
        <Link href={`/client/app/workouts/${workout._id}`}>
          <Image
            src={workout?.thumbnail?.trim() || "/not-found.png"}
            alt="Total Core Workout"
            width={1024}
            height={1024}
            unoptimized
            onError={e => e.target.src = "/not-found.png"}
            className="w-full h-[250px] object-cover rounded-xl border-1"
          />
        </Link>
      </div>
      <div className="mt-2 text-lg font-bold">{workout.title}</div>
    </div>)}
  </div>
}