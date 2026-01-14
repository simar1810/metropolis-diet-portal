"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import AssignMealModal from "@/components/modals/Assignmealmodal";
import { Badge } from "@/components/ui/badge";
import { sendData } from "@/lib/api";
import { getCustomMealPlans } from "@/lib/fetchers/app";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDropdown, IoMdAddCircle } from "react-icons/io";
import { LuTrash } from "react-icons/lu";
import { PiSparkleFill } from "react-icons/pi";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

export default function Page() {
  const [query, setQuery] = useState("")
  const { isLoading, error, data } = useSWR("custom-meal-plans", () =>
    getCustomMealPlans("coach")
  );
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "daily";
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200)
    return <ContentError title={error || data?.message} />;

  const mealRegex = new RegExp(query, "i")

  const filteredMealPlans = ["daily", "weekly", "monthly"].includes(mode)
    ? data
      .data
      .filter((meal) => meal.mode === mode)
      .filter(meal => mealRegex.test(meal.title))
    : data
      .data
      .filter(meal => mealRegex.test(meal.title));
  const handleNavigate = (planMode) => {
    if (localStorage.getItem("aiMealPlan")) {
      localStorage.removeItem('aiMealPlan')
    }
    router.push(`/coach/meals/add-custom/${planMode}`);
    setShowDropdown(false);
  };
  const handleDeleteMeal = async (id) => {
    try {
      setLoading(true);
      const response = await sendData(`app/meal-plan/custom?id=${id}`, {}, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success("Meal deleted successfully!");
      await mutate("custom-meal-plans");
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="content-container flex flex-col">
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between py-3 border-b border-gray-200 relative gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Meals & Recipes</h2>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => router.push("/coach/meals/ai")}
              className="px-2 md:px-3 py-2 md:py-3 flex items-center justify-around gap-1 rounded-lg bg-[#00984A] hover:bg-green-700 text-white font-semibold text-[10px] md:text-xs"
            >
              <PiSparkleFill size={14} className="text-white" />
              Create AI Meal Plan
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="px-2 md:px-3 py-2 md:py-3 flex items-center justify-around gap-1 rounded-lg bg-[#00984A] hover:bg-green-700 text-white font-semibold text-[10px] md:text-xs"
              >
                <IoMdAddCircle size={14} className="text-white" />
                Create Manual Plan
                <IoIosArrowDropdown
                  size={16}
                  className={cn(
                    "text-white ml-1 transition-transform",
                    showDropdown ? "rotate-180" : ""
                  )}
                />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border border-gray-200 rounded-md z-20">
                  {["daily", "weekly", "monthly"].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleNavigate(item)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)} Plan
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-between ">
          <div className="flex gap-6 mt-5">
            {["daily", "weekly", "monthly"].map((tab) => (
              <Link
                key={tab}
                href={`?mode=${tab}`}
                className={cn(
                  "pb-2 text-sm md:text-base font-medium text-gray-600 hover:text-black transition",
                  mode === tab
                    ? "border-b-2 border-[#00984A] text-[#00984A] font-semibold"
                    : ""
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Plans
              </Link>
            ))}
          </div>
          <SearchFormControl
            query={query}
            setQuery={setQuery}
          />
        </div>
      </div>
      <div className="flex-1  no-scrollbar mt-4 pb-20">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Meal Plans{" "}
          <span className="text-green-600 bg-green-50 p-[5px] rounded-xl text-sm">
            {filteredMealPlans.length}
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMealPlans.map((meal) => (
            <div
              key={meal._id}
              className="relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <Link href={`/coach/meals/list-custom/${meal._id}`}>
                <Image
                  src={meal.image || "/healthy-diet-food.webp"}
                  alt={meal.title}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover"
                  onError={(e) => (e.currentTarget.src = "/not-found.png")}
                />
              </Link>
              <Badge
                className={cn(
                  "absolute top-3 left-3 text-xs font-normal bg-[#00000081] text-white px-3"
                )}
              >
                {meal.admin ? "Admin" : "Manual"}
              </Badge>
              {!meal.admin && (
                <button
                  onClick={() => handleDeleteMeal(meal._id)}
                  className="absolute z-10 top-[-2px] right-[-2px] bg-red-600 hover:bg-red-700 text-white pl-2 pr-3 pt-3 pb-2 rounded-md"
                >
                  <LuTrash size={14} />
                </button>
              )}
              <p className="font-bold px-4 pt-2">{meal.title}</p>
              <div className="p-4 pt-0 flex items-center justify-between gap-5">
                <Link href={`/coach/meals/list-custom/${meal._id}`}>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {meal.description}
                  </p>
                </Link>
                <AssignMealModal planId={meal._id} type="custom" />
              </div>
            </div>
          ))}
        </div>
        {filteredMealPlans.length === 0 && (
          <ContentError
            title="No Meal Plans Found!"
            className="font-bold mt-10 border-0"
          />
        )}
      </div>
    </main>

  );
}


function SearchFormControl({ query, setQuery }) {
  return <FormControl
    query={query}
    onChange={e => setQuery(e.target.value)}
    placeholder="search by title"
  />
}
