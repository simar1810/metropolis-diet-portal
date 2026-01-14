"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { getMealPlanById } from "@/lib/fetchers/app";
import { Clock } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export default function Page() {
  const { id } = useParams()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { isLoading, error, data } = useSWR(`app/meal-plan/${id}`, () => getMealPlanById(id));
  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const planData = data.data;
  const selectedMeals = planData.meals[selectedIndex]?.meals || [];

  return <div className="content-container">
    <h4 className="mb-8">{planData.name}</h4>
    <div className="flex items-stretch gap-4">
      <MealTypesList
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
        mealTypes={planData.meals}
      />
    </div>
    <div className="mt-8 flex gap-4 overflow-x-auto">
      {selectedMeals.map((recipe, index) => <RecipeDetails
        key={index}
        recipe={recipe}
        mealPlan={planData}
        selectedIndex={selectedIndex}
      />)}
    </div>
  </div>
}

function MealTypesList({
  mealTypes,
  selectedIndex,
  setSelectedIndex
}) {
  return <div className="flex items-center gap-4 overflow-x-auto">
    {mealTypes.map((type, index) => <div
      key={index}
      className={`text-[12px] font-semibold px-4 py-2 border-1 border-[var(--accent-1)] cursor-pointer whitespace-nowrap rounded-[8px] ${index === selectedIndex ? "bg-[var(--accent-1)] text-[var(--primary-1)]" : "text-[var(--accent-1)]"}`}
      onClick={() => setSelectedIndex(index)}
    >
      {type.mealType}
    </div>)}
  </div>
}

function RecipeDetails({ recipe }) {
  return <div className="min-w-96 max-w-96 border border-grey-500 rounded-md px-4 py-4 pr-4 relative">
    <Image
      src={recipe.image}
      onError={e => e.target.src = "/not-found.png"}
      height={540}
      width={540}
      alt="Recipe Image"
      className="w-full h-[180px] object-cover rounded-md mb-2"
    />
    <h3>{recipe.name}</h3>
    <p className="leading-[1.2] text-[14px] mt-2">{recipe.description}</p>
    <div className="mt-2 flex items-center gap-2">
      <Clock size={20} fill="#00984A" className="text-[var(--primary-1)]" />
      <span className="text-[14px]">{recipe.meal_time}</span>
    </div>
  </div>
}