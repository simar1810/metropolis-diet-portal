"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import MealDisplayCard from "@/components/pages/coach/meals/MealDisplayCard";
import { getPlans } from "@/lib/fetchers/app";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("")
  const { isLoading, error, data } = useSWR("getPlans", getPlans);
  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  return <div className="content-container content-height-screen">
    <Header
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
    <MealPlanContainer
      allMealPlans={data.data}
      searchQuery={searchQuery}
    />
  </div>
}

function Header({
  searchQuery,
  setSearchQuery
}) {
  return <div className="mb-4 pb-4 flex items-center gap-4 border-b-1">
    <h4>Meal Plans</h4>
    <FormControl
      className="lg:min-w-[280px] [&_.input]:focus:shadow-2xl [&_.input]:bg-[var(--comp-1)] text-[12px] ml-auto"
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
  return <div className="grid grid-cols-4 gap-4">
    {plans.map(plan => <MealDisplayCard
      plan={plan}
      key={plan._id} />)}
  </div>
}