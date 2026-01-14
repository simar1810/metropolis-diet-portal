"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import RecipeModal from "@/components/modals/RecipeModal";
import RecipeDisplayCard from "@/components/pages/coach/meals/RecipeDisplayCard";
import { Button } from "@/components/ui/button";
import { getRecipes } from "@/lib/fetchers/app";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("getRecipes", getRecipes);
  const [query, setQuery] = useState("");

  if (isLoading) return <ContentLoader />

  if (error || !data.success) return <ContentError title={error || data.message} />
  const recipes = data.data.filter(recipe => recipe?.title?.toLowerCase()?.includes(query?.toLowerCase()));

  return <div className="content-container mt-8 md:mt-0">
    <Header value={query} onChange={value => setQuery(value)} />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
      {recipes.map(plan => <RecipeDisplayCard
        key={plan._id}
        plan={plan}
      />)}
    </div>
  </div>
}

function Header({ value, onChange }) {
  return <div className="md:mb-4 pb-4 flex items-center justify-between gap-4 md:border-b-1">
    <h4>Recipes</h4>
    <FormControl
      className="hidden md:block lg:min-w-[280px] [&_.input]:focus:shadow-2xl [&_.input]:bg-[var(--comp-1)] text-[12px] ml-auto"
      placeholder="Search Recipe.."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <RecipeModal type="new" />
  </div>
}