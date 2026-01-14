"use client";
import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changeSearchQuery, setCalorieResult, setView, toggleRecipe } from "@/config/state-reducers/calorie-counter";
import useDebounce from "@/hooks/useDebounce";
import { fetchData, sendData } from "@/lib/api";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CalorieContainer() {
  const { query, dishesData, selected, dispatch } = useCurrentStateContext();

  async function fetchDishedData() {
    try {
      dispatch(setView(3));
      const response = await sendData("app/recipees", { recipes: selected })
      if (!response.success) throw new Error(response.message || response.error);
      dispatch(setCalorieResult(response.data));
    } catch (error) {
      toast.error(error.message);
    }
  }

  return <div className="py-4 content-height-screen">
    <Input
      value={query}
      onChange={e => dispatch(changeSearchQuery(e.target.value))}
      placeholder="search..."
      className="font-semibold"
    />
    {query.length === 0 && !dishesData
      ? <ContentError title="Please search for a recipe" />
      : <div className="mt-4 grid grid-cols-1 md:grid-cols-3 items-start gap-4">
        <RecipesSearchResults fetchDishedData={fetchDishedData} />
        <CalorieResult />
      </div>
    }
  </div>
}

function RecipesSearchResults({ fetchDishedData }) {
  const { query, selected, dispatch } = useCurrentStateContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 1000)

  useEffect(function () {
    ; (async function () {
      try {
        setLoading(true)
        const response = await fetchData(`app/recipees?query=${debouncedQuery}`);
        if (!response.success) throw new Error(response.message || "Internal Server Error!");
        setData(response);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedQuery]);

  if (query.length === 0) return <ContentError className="mt-0" title="Please search for a query!" />
  if (loading) return <div className="h-[60vh] flex items-center justify-center">
    <Loader />
  </div>

  if (data?.status_code !== 200) return <ContentError className="mt-0" title={data?.message} />
  const dishes = data?.data;
  if (dishes.length === 0) return <ContentError className="mt-0" title={"No recipes found for this query!"} />
  return <div className="md:sticky top-20">
    <div className="bg-white p-4 rounded-[8px] border-1 h-[60vh] overflow-y-auto">
      {dishes.map((item, index) => <div
        key={index}
        className="mb-4 flex items-center gap-4 hover:[&_.add-btn]:bg-[var(--accent-2)]"
      >
        <div className={`w-full p-4 flex items-start justify-between rounded-md bg-[#00984A]/10 hover:bg-[#00984A] hover:text-white cursor-pointer`}>
          <div>
            <h3 className="font-semibold text-[14px] leading-[1] mb-4">{item.dish_name || item.title}</h3>
            {typeof item.calories === "object"
              ? <RecipeMacros item={item} />
              : <DishMacros item={item} />}
          </div>
          <div className="text-right">
            {/* <p className="text-[14px] font-bold">{item.calories}</p>&nbsp; */}
            <Button
              variant="wz"
              className="add-btn !w-[32px] !h-[32px] ml-auto rounded-full aspect-square"
              onClick={() => dispatch(toggleRecipe(item._id.$oid))}
            >
              {!selected.includes(item._id.$oid) ? <Plus /> : <Minus />}
            </Button>
          </div>
        </div>
      </div>)}
    </div>
    {selected?.length > 0 && <Button
      variant="wz"
      className="w-full mt-4"
      onClick={fetchDishedData}
    >
      Continue
    </Button>
    }
  </div>
}

function RecipeMacros({ item }) {
  return <p className="text-[14px] text-[#000000]/40">
    <span className="pr-4">Carbs&nbsp;{item?.calories?.carbs}</span>
    <span className="pr-4">Protein&nbsp;{item?.calories?.fats}</span>
    <span className="pr-4">Fat&nbsp;{item?.calories?.proteins}</span>
  </p>
}

function DishMacros({ item }) {
  return <p className="text-[14px] text-[#000000]/40">
    <span className="pr-4">Carbs&nbsp;{item.carbohydrates}</span>
    <span className="pr-4">Protein&nbsp;{item.fats}</span>
    <span className="pr-4">Fat&nbsp;{item.protein}</span>
  </p>
}

function CalorieResult() {
  const { view, dishesData } = useCurrentStateContext();

  if (view === 3) return <>
    <div className="min-h-[400px] bg-white flex items-center justify-center border-1 rounded-[8px]"><Loader /></div>
    <div className="min-h-[400px] bg-white flex items-center justify-center border-1 rounded-[8px]"><Loader /></div>
  </>

  if (view === 1) return <>
    <ContentError className="mt-0" title="Please search For A Recipe" />
    <ContentError className="mt-0" title="Please search For A Recipe" />
  </>

  const dishes = dishesData?.dishes;
  return <>
    <div>
      <div className="bg-[var(--primary-1)] p-4 border-1 rounded-[8px] divide-y-1">
        {dishes.map((dish, index) => <RetrievedRecipees
          key={index}
          dish={dish}
        />)}
      </div>
      <BreakDown dishesData={dishesData} />
    </div>
    <GlycemicIndex dishesData={dishesData} />
  </>
}

function RetrievedRecipees({ dish }) {
  return <div className="py-4 flex items-start justify-between">
    <div>
      <div className="mb-2 flex items-start gap-1">
        <h3 className="w-fit font-semibold text-[16px] lg:text-[20px] leading-[1] mb-0 inline">{dish.dish_name}</h3>
        <span className="bg-[#00984A]/10 text-[10px] px-2 py-1 rounded-[4px]">Main</span>
      </div>
      <p className="text-[14x] text-[#000000]/50">{dish.staple_areas}</p>
    </div>
    <div>
      <span className="bg-[#00984A]/10 text-[16px] leading-[1] px-2 py-2 rounded-md">{dish.calories?.split(" ")?.at(0)}</span>&nbsp;
      <span>Kcal</span>
    </div>
  </div>
}

function BreakDown({ dishesData }) {
  return <div className="bg-[var(--primary-1)] mt-4 p-4 border-1 rounded-[8px]">
    <h3 className="font-bold text-[20px] mb-4">Nutrition Break Down</h3>
    <div className="mb-1 py-1 flex items-center justify-between border-b-[2px]">
      <h3 className="font-semibold text-[16px] text-[#444444]">Serving Size</h3>
      <h3 className="font-semibold text-[16px] text-[#444444]">{dishesData?.nutritionBreakDown?.serving_size}</h3>
    </div>
    <div className="mb-1 py-1 flex items-center justify-between border-b-[2px] bordergray-800">
      <h3 className="font-semibold text-[16px] text-[#444444]">Calories</h3>
      <h3 className="font-semibold text-[16px] text-[#444444]">{dishesData?.nutritionBreakDown?.calories}</h3>
    </div>
    <div className="divide-y-[2px]">
      {dishesData?.nutritionBreakDown?.nutrition?.map((nutrition, index) => <div key={index} className="py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[14px] text-[#444444]">{nutrition?.title}</h3>
          <p className="mr-auto">{nutrition?.amount}</p>
          <p>{nutrition?.percent}</p>
        </div>
        <div className="pl-4">
          {nutrition.children.map((subnutrition, index) => <div key={index} className="flex items-center justify-between gap-2 hover:bg-[#CCCCCC33]">
            <h3 className="text-[14px] font-medium text-[#444444]">{subnutrition.title}</h3>
            <p className="text-[14px] mr-auto">{subnutrition.amount}</p>
            <p>{subnutrition.percent}</p>
          </div>)}
        </div>
      </div>)}
    </div>
  </div>
}

function GlycemicIndex({ dishesData }) {
  return <div>
    <div className="bg-[var(--primary-1)] p-4 border-1 rounded-[8px]">
      <NutritionCard
        protein={parseFloat(dishesData?.percentages?.protein?.replace("%", ""))}
        carbs={parseFloat(dishesData?.percentages?.carbs?.replace("%", ""))}
        fats={parseFloat(dishesData?.percentages?.fats?.replace("%", ""))}
      />
    </div>
    <div className="bg-[var(--primary-1)] mt-4 p-4 border-1 rounded-[8px]">
      <h3 className="font-bold text-[24px] mb-4">Estimated Glycemic Index</h3>
      <div className="pt-0 pb-4">
        <p className="text-right font-bold text-[20px] mb-2">{dishesData?.glycemic_index}</p>
        <div className="w-full h-[8px] bg-[#D9D9D9]/50 rounded-md">
          <div style={{ width: dishesData?.percentages?.protein }} className={`h-[8px] rounded-full bg-[#00984A]`} />
        </div>
      </div>
    </div>
    <div className="bg-[var(--primary-1)] mt-4 p-4 border-1 rounded-[8px]">
      <h3 className="font-bold text-[24px] mb-6">Food Tags</h3>
      <div className="flex items-center flex-wrap gap-4">
        {dishesData?.food_tags?.map((tag, index) => <div
          key={index}
          className="bg-[#E6F7F2] text-[#03632C] text-[14px] leading-[1] font-bold px-4 py-2 rounded-full"
        >
          •&nbsp;{tag}
        </div>)}
      </div>
    </div>
  </div>
}

function NutritionCard({
  protein,
  carbs,
  fats
}) {
  const totalCalories = 498;
  const nutritionData = [
    { name: "Protein", value: protein, color: "#57D163" },
    { name: "Carbs", value: carbs, color: "#03632C" },
    { name: "Fat", value: fats, color: "#F84135" },
  ];

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div>
      <div className="flex items-center">
        {/* Circular Progress Chart */}
        <div className="relative w-54 h-54">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#E 0E0E0"
              strokeWidth="8"
            />
            {/* Progress Segments */}
            {nutritionData.map((item, index) => {
              const dash = (item.value / 100) * circumference;
              const dashArray = `${dash} ${circumference - dash}`;
              const strokeDashOffset = circumference - offset;
              offset += dash;
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={dashArray}
                  strokeDashoffset={strokeDashOffset.toString()}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              );
            })}
          </svg>
          {/* Centered Text */}
          <div className="absolute inset-0 flex items-center justify-center font-semibold text-lg">
            {totalCalories} Kcal
          </div>
        </div>

        {/* Nutrition Details */}
        <div className="ml-4 w-full">
          {nutritionData.map((item) => (
            <div key={item.name} className="mb-2">
              <div className="flex justify-between text-gray-600">
                <span>{item.name}</span>
                <span className="font-semibold">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};