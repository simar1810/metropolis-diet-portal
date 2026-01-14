"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import UpdateMealPlanRecipeModal from "@/components/modals/tools/UpdateMealPlanRecipeModal";
import UpdateMealPlanModal from "@/components/modals/tools/UpdateMealPlanModal";
import { getMealPlanById } from "@/lib/fetchers/app";
import { ChevronLeft, ChevronRight, Clock, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";
import { useAppSelector } from "@/providers/global/hooks";
import AssignMealModal from "@/components/modals/Assignmealmodal";

export default function Page() {
  const { id } = useParams()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { _id } = useAppSelector(state => state.coach.data)

  const { isLoading, error, data } = useSWR(`app/meal-plan/${id}`, () => getMealPlanById(id));
  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const planData = data.data;
  const selectedMeals = planData.meals[selectedIndex]?.meals || [];

  return <div className="content-container">
    <div className="flex items-center gap-4 mb-8">
      <h4>{planData.name}</h4>
      <AssignMealModal type="normal" planId={planData._id} />
    </div>
    <div className="flex items-center gap-4 pb-4">
      <MealTypesList
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
        mealTypes={planData.meals}
      />
      <div className="w-[2px] bg-[var(--dark-1)]/25 ml-auto" />
      <Link
        href={`/coach/meals/add-plan?id=${id}`}
        className="text-[var(--accent-1)] text-[14px] whitespace-nowrap font-bold px-4 py-2 rounded-[4px] border-1 border-[var(--accent-1)]"
      >
        Copy & Edit
      </Link>
      {_id === planData.coach && <UpdateMealPlanModal mealPlan={planData} />}
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
  const scrollRef = useRef()

  const scrollLeft = () => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.children[0]
      const scrollAmount = firstChild?.offsetWidth || 100
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.children[0]
      const scrollAmount = firstChild?.offsetWidth || 100
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return <div className="flex items-center overflow-x-auto relative">
    <div
      ref={scrollRef}
      className="flex items-center gap-4 overflow-x-auto pb-4 relative scrollbar-hide"
    >
      {mealTypes.map((type, index) => (
        <div
          key={index}
          className={`text-[12px] font-semibold px-4 py-2 border-1 border-[var(--accent-1)] cursor-pointer whitespace-nowrap rounded-[8px] ${index === selectedIndex
            ? "bg-[var(--accent-1)] text-[var(--primary-1)]"
            : "text-[var(--accent-1)]"
            }`}
          onClick={() => setSelectedIndex(index)}
        >
          {type.mealType}
        </div>
      ))}
    </div>
    <ChevronLeft
      className="min-h-[16px] min-w-[16px] bg-[var(--accent-1)] absolute left-1 
        top-1/2 translate-y-[-70%] border-1 rounded-full cursor-pointer p-1 opacity-50 hover:opacity-100"
      onClick={scrollLeft}
    />
    <ChevronRight
      className="min-h-[16px] min-w-[16px] bg-[var(--accent-1)] absolute right-1 
        top-1/2 translate-y-[-70%] border-1 rounded-full cursor-pointer p-1 opacity-50 hover:opacity-100"
      onClick={scrollRight}
    />
  </div>
}

function RecipeDetails({ selectedIndex, mealPlan, recipe }) {
  const coachId = useAppSelector(state => state.coach.data._id);
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
    {mealPlan.coach === coachId && <UpdateMealPlanRecipeModal
      mealPlan={mealPlan}
      recipe={recipe}
      mealType={mealPlan.meals[selectedIndex]?.mealType}
      key={recipe._id}
    />}
  </div>
}