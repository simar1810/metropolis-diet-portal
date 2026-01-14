"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import ActivityTool from "@/components/pages/coach/dashboard/ActivityTool";
import Stories from "@/components/pages/coach/dashboard/Stories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getClientHome, getMarathonLeaderBoard } from "@/lib/fetchers/app";
import { nameInitials } from "@/lib/formatter";
import { useAppSelector } from "@/providers/global/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";

export default function Page() {
  return <div className="mt-8">
    <Container />
  </div>
}

function Container() {
  const { _id } = useAppSelector(state => state.client.data)
  const client = useAppSelector(state => state.client.data)
  const { isLoading, error, data } = useSWR("clientHome", () => getClientHome(_id));

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const clientHomeData = data.data;
  return <>
    <ActivityTool activities={clientHomeData.programs} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
      <Stories stories={clientHomeData.story} />
      {clientHomeData.meal
        ? <MealDetails meal={clientHomeData.meal} />
        : <ContentError title="No Meal Plan" className="font-bold !min-h-[200px]" />}
    </div>
  </>
}

function MealDetails({ meal }) {
  return <div className="bg-[var(--primary-1)] mt-8 p-4 border-1 rounded-[12px]">
    <Image
      alt=""
      height={400}
      width={400}
      src={meal?.image}
      className="w-full max-h-[300px] object-contain object-center"
    />
    <h3 className="my-2">{meal?.name}</h3>
    <p>{meal?.description}</p>
  </div>
}

function getBgColor(index) {
  switch (index) {
    case 0:
      return "bg-[#FFDA47]";
    case 1:
      return "bg-[#F1EAEA]";
    case 2:
      return "bg-[#D7A07C]";

    default:
      return "bg-[var(--comp-1)]";
  }
}

function MarathonLeaderBoard() {
  const router = useRouter();
  const { cache } = useSWRConfig();
  const { isLoading, error, data } = useSWR(`app/marathon-points/monthly`, () => getMarathonLeaderBoard(null, router, cache));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const clients = data.data;
  return <div className="content-container max-h-[50vh] overflow-y-auto">
    <div className="flex items-center gap-4">
      <h4 className="leading-[1] mb-4 mr-auto">Marathon Leaderboard</h4>
    </div>
    <div>
      {clients.map((client, index) => <div
        className={`mb-4 p-4 flex items-center gap-4 border-1 rounded-[10px] ${getBgColor(index)}`}
        key={index}>
        <span>{index + 1}</span>
        <Avatar>
          <AvatarImage src={client.client.profilePhoto} />
          <AvatarFallback>{nameInitials(client.client.name)}</AvatarFallback>
        </Avatar>
        <h3>{client.client.name}</h3>
        <p className="ml-auto">{client.totalPointsInRange}&nbsp;pts</p>
      </div>)}
    </div>
  </div>;
}