"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getClientMealPlanById, getPlans } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("")
  const clientId = useAppSelector(state => state.client.data._id)
  const { isLoading, error, data } = useSWR("getPlans", () => getClientMealPlanById(clientId));
  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  return <main className="content-container content-height-screen">
    <Header
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
    <MealPlanContainer
      allMealPlans={data.data}
      searchQuery={searchQuery}
    />
  </main>
}

function Header({
  searchQuery,
  setSearchQuery
}) {
  return <div className="mb-4 pb-4 flex flex-col  md:flex-row md:items-center gap-4 border-b-1">
    <h4>Meal Plans</h4>
    <FormControl
      className="lg:min-w-[280px] [&_.input]:focus:shadow-2xl [&_.input]:bg-[var(--comp-1)] text-[12px] md:ml-auto"
      placeholder="Search Meal.."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
  </div>
}

function MealPlanContainer({
  allMealPlans,
  searchQuery
}) {
  const plans = allMealPlans.filter(item => new RegExp(searchQuery, "i").test(item.name));
  if (plans.length === 0) return <ContentError
    className="font-bold"
    title="No Meals plans assigned to the client"
  />
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {plans.map(plan => <MealDisplayCard
      plan={plan}
      key={plan._id} />)}
  </div>
}

function MealDisplayCard({ plan }) {
  return <Card className="p-0 rounded-[4px] shadow-none gap-2">
    <CardHeader className="relative aspect-video">
      <Link href={`/client/app/meals/${plan._id}`}>
        <Image
          fill
          src={plan.image || "/"}
          alt=""
          className="object-cover bg-black"
        />
      </Link>
      {/* <Badge variant="wz" className="text-[9px] font-semibold absolute top-2 left-2">{plan.tag}</Badge> */}
    </CardHeader>
    <CardContent className="p-2">
      <div className="flex items-start justify-between gap-1">
        {/* <Link href={`/coach/meals/list/${plan._id}`}> */}
        <h5 className="text-[12px]">{plan.name}</h5>
        {/* </Link> */}
      </div>
      <p className="text-[14px] text-[var(--dark-1)]/25 leading-tight mt-2">
        {plan.description}
      </p>
    </CardContent>
  </Card>
}