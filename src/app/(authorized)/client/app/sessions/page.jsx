"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { getWzSessions } from "@/lib/fetchers/app";
import { format } from "date-fns";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("wzsessions", () => getWzSessions("client"));

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const sessions = data.data;

  return <div className="content-container content-height-screen">
    <h4 className="mb-6">Sessions</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8">
      {sessions.map(session => <div key={session._id} className="rounded-xl shadow-md px-4 py-4 md:px-6 md:py-6 ring-1 ring-zinc-100 shadow-zinc-300">
        <div className="max-h-[40vh] mb-4 rounded-2xl overflow-hidden">
          <YouTubeEmbed link={session.videoUrl} />
        </div>
        <div className="flex flex-col gap-5 justify-between">
        <div>
            <h2 className="text-base mb-1 text-zinc-600">{session.name}</h2>
            <p className="text-sm text-zinc-400 font-medium">{session.day},&nbsps;{format(session.date, "MMM d, yyyy 'at' hh:mm a")}</p>
        </div>
        <div className="flex gap-4 items-center">
          <p><span className="text-sm md:text-base bg-green-500 text-white rounded-xl px-1 md:px-2 py-1 mr-1 md:mr-2 font-semibold">Trainer:</span><span className="text-sm md:text-base text-zinc-600 font-semibold">{session.trainerName}</span></p>
          <p><span className="text-sm md:text-base bg-green-500 text-white rounded-xl px-1 md:px-2 py-1 mr-1 md:mr-2 font-semibold">Type:</span><span className="text-sm md:text-base text-zinc-600 font-semibold">{session.workoutType}</span></p>
        </div>
        </div>
      </div>)}
    </div>
  </div>
}