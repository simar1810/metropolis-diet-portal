"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import PDFRenderer from "@/components/modals/PDFRenderer";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import MetropolisNotesSticky from "@/components/common/MetropolisNotesSticky";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { getCustomMealPlans } from "@/lib/fetchers/app";
import { customMealDailyPDFData } from "@/lib/pdf";
import { flattenMealPlanDishes } from "@/lib/mealPlanUtils";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { Download, FileDown, MoreVertical, SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

export default function Page() {
  const { id } = useParams();
  return <Suspense>
    <MealPlanDetailsContainer id={id} />
  </Suspense>
}

function MealPlanDetailsContainer({ id }) {
  const { isLoading, error, data } = useSWR(`custom-meal-plans/${id}`, () => getCustomMealPlans("coach", id));

  const responseData = data?.data;
  const hasNoPlan = Array.isArray(responseData) ? responseData.length === 0 : !responseData;
  const customPlan = Array.isArray(responseData) ? responseData[0] : responseData;
  const planKeys = useMemo(() => {
    const plans = customPlan?.plans || {};
    const keys = Object.keys(plans);

    if (keys.length === 0) return keys;

    if (customPlan?.mode === "monthly") {
      const toTime = (value) => {
        if (!value) return Number.MAX_SAFE_INTEGER;
        const [day, month, year] = value.split("-").map(Number);
        if ([day, month, year].every(Number.isFinite)) {
          const time = new Date(year, month - 1, day).getTime();
          if (Number.isFinite(time)) return time;
        }
        const fallback = new Date(value).getTime();
        return Number.isFinite(fallback) ? fallback : Number.MAX_SAFE_INTEGER;
      };

      return [...keys].sort((a, b) => toTime(a) - toTime(b));
    }

    if (customPlan?.mode === "weekly") {
      const weekOrder = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      return [...keys].sort((a, b) => {
        const ia = weekOrder.indexOf(String(a).toLowerCase());
        const ib = weekOrder.indexOf(String(b).toLowerCase());
        if (ia === -1 || ib === -1 || ia === ib) {
          return String(a).localeCompare(String(b));
        }
        return ia - ib;
      });
    }

    return keys;
  }, [customPlan?.mode, customPlan?.plans]);

  const [selectedPlan, setSelectedPlan] = useState(() => planKeys.at(0) || "");
  const [selectedMealType, setSelectedMealType] = useState("");

  useEffect(() => {
    if (planKeys.length === 0) {
      if (selectedPlan) setSelectedPlan("");
      return;
    }

    if (!planKeys.includes(selectedPlan)) {
      setSelectedPlan(planKeys[0]);
    }
  }, [planKeys, selectedPlan]);

  useEffect(() => {
    if (!selectedPlan) {
      if (selectedMealType) setSelectedMealType("");
      return;
    }

    const planForDay = customPlan?.plans?.[selectedPlan];
    const mealsForPlan = Array.isArray(planForDay)
      ? planForDay
      : Array.isArray(planForDay?.meals)
        ? planForDay.meals
        : [];

    if (mealsForPlan.length === 0) {
      if (selectedMealType) setSelectedMealType("");
      return;
    }

    const hasSelected = mealsForPlan.some(entry => entry?.mealType === selectedMealType);
    if (!hasSelected) {
      setSelectedMealType(mealsForPlan[0]?.mealType || "");
    }
  }, [customPlan?.plans, selectedPlan, selectedMealType]);

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200 || hasNoPlan) {
    return <ContentError
      title={error || data?.message || "No Such Plan Found!"}
    />
  }

  return <main>
    <MetropolisNotesSticky
      clientId={customPlan?.clients?.at(0)?._id}
      defaultValue={customPlan?.clients?.at(0)?.metropolisNotes}
      swrKey={`custom-meal-plans/${id}`}
      title="Metropolis Notes"
    />
    <DisplayMealStats meals={{ plans: { [selectedPlan]: customPlan.plans[selectedPlan] } }} />
    <div className="content-container content-height-screen mt-4 grid grid-cols-1 md:grid-cols-2 md:divide-x-1">
      <CustomMealMetaData
        customPlan={customPlan}
        selectedPlan={selectedPlan}
        hasPlanData={planKeys.length > 0}
      />
      <CustomMealsListing
        customPlan={customPlan}
        days={planKeys}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
      />
    </div>
  </main>
}

function CustomMealMetaData({ customPlan }) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSent, setPdfSent] = useState(false);
  const [pdfFile, setPdfFile] = useState()

  const handleSendPdf = async function () {
    const toastId = toast.loading("Generating meal plan pdf...")
    const payload = createMealPlanPdfPayload(customPlan, customPlan?.clients?.at(0))
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const res = await fetch('/api/coach/meals/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setPdfFile(new File([blob], "meal-plan.pdf", { type: 'application/pdf' }))
      setPdfSent(true)
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      alert("Could not generate PDF. Please check the console.");
    } finally {
      setGeneratingPdf(false);
      toast.dismiss(toastId)
    }
  };

  function downloadPDF() {
    if (!pdfFile) return;

    const url = window.URL.createObjectURL(pdfFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile.name || "meal-plan.pdf";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return <div className="p-4 pr-8">
    <div className="flex items-center gap-4">
      <h4 className="mr-auto text-base mb-4 md:mb-0">{customPlan.title}</h4>
      <Link
        href={`/coach/meals/add-custom?creationType=edit&mode=${customPlan.mode}&mealId=${customPlan._id}`}
        className="hidden md:block px-4 py-2 rounded-[10px] bg-[var(--accent-1)] text-white font-bold leading-[1] text-[14px]"
        variant="wz_outline"
      >
        Edit
      </Link>
      <Button
        disabled={generatingPdf}
        onClick={handleSendPdf}
        variant="wz"
        size="sm"
      >Send PDF</Button>
      {pdfSent && <Button
        onClick={downloadPDF}
        variant="icon">
        <Download />
      </Button>}
      {pdfSent && <SendPDFViaWhatsapp
        clientId={customPlan?.clients?.at(0)?._id}
        pdf={pdfFile}
      />}
    </div>
    <div className="flex items-center gap-2">
      {!isNaN(customPlan.noOfDays) && <div className="font-bold">
        {customPlan.noOfDays} Days
      </div>}
    </div>
    <Image
      alt=""
      src={customPlan.image || "/not-found.png"}
      height={500}
      width={500}
      className="w-full max-h-[200 px] my-4 rounded-[10px] object-cover aspect-video"
      onError={e => e.target.src = "/not-found.png"}
    />
    <p>{customPlan.description}</p>
    {customPlan.guidelines && <div className="mt-4">
      <h5 className="font-bold">Guidelines</h5>
      <p>{customPlan.guidelines}</p>
    </div>}
    {customPlan.supplements && <div className="mt-4">
      <h5 className="font-bold">Supplements</h5>
      <p>{customPlan.supplements}</p>
    </div>}
  </div >
}

function CustomMealsListing({
  customPlan,
  days = [],
  selectedPlan,
  onPlanChange,
  selectedMealType,
  onMealTypeChange,
}) {
  const planForDay = selectedPlan ? customPlan.plans?.[selectedPlan] : undefined;
  const selectedMealTypes = Array.isArray(planForDay)
    ? planForDay
    : Array.isArray(planForDay?.meals)
      ? planForDay.meals
      : [];

  const selectedMealsForMealType = selectedMealTypes
    .find(type => type?.mealType === selectedMealType)?.meals || [];

  const normalizedSelectedMealsForMealType = useMemo(() => {
    const shouldFlatten = ["lunch", "dinner"].includes(String(selectedMealType || "").toLowerCase());
    if (!shouldFlatten) return selectedMealsForMealType;

    return selectedMealsForMealType.map(opt => ({
      ...opt,
      dishes: flattenMealPlanDishes(opt?.dishes),
    }));
  }, [selectedMealsForMealType, selectedMealType]);

  const mealTypeTotals = useMemo(() => {
    const parseNum = (val) => {
      if (typeof val === "number") return Number.isFinite(val) ? val : 0;
      if (typeof val === "string") {
        const n = parseFloat(val.replace(/,/g, ""));
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    };

    return normalizedSelectedMealsForMealType
      .map(meal => flattenMealPlanDishes(meal?.dishes))
      .flatMap(meal => meal)
      .reduce(
        (acc, meal) => {
          const caloriesVal =
            typeof meal?.calories === "object"
              ? meal?.calories?.total
              : meal?.calories;
          const proteinVal = meal?.protein ?? meal?.calories?.proteins;
          const carbsVal = meal?.carbohydrates ?? meal?.calories?.carbs;
          const fatsVal = meal?.fats ?? meal?.calories?.fats;

          acc.calories += parseNum(caloriesVal);
          acc.protein += parseNum(proteinVal);
          acc.carbohydrates += parseNum(carbsVal);
          acc.fats += parseNum(fatsVal);
          return acc;
        },
        { calories: 0, protein: 0, carbohydrates: 0, fats: 0 }
      );
  }, [normalizedSelectedMealsForMealType]);

  return <div className="p-4 md:pl-8 relative">
    {customPlan.draft && <Badge className="absolute top-2 right-2">
      <SquarePen />
      Draft
    </Badge>}
    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
      {selectedMealTypes.map((mealType, index) => (
        <button
          key={index}
          onClick={() => onMealTypeChange?.(mealType.mealType)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${mealType.mealType === selectedMealType
              ? "bg-[#1A1A1A] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          {snakeCaseToTitleCase(mealType.mealType)}
        </button>
      ))}
    </div>
    {selectedMealType && (
      <div className="mt-6 p-4 rounded-xl bg-gray-50/50 border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Calories</span>
          <span className="text-lg font-bold text-[#1A1A1A] leading-tight">{mealTypeTotals.calories.toFixed(1)} <span className="text-[12px] font-normal text-gray-500">kcal</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Protein</span>
          <span className="text-lg font-bold text-[#1A1A1A] leading-tight">{mealTypeTotals.protein.toFixed(1)} <span className="text-[12px] font-normal text-gray-500">g</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Fats</span>
          <span className="text-lg font-bold text-[#1A1A1A] leading-tight">{mealTypeTotals.fats.toFixed(1)} <span className="text-[12px] font-normal text-gray-500">g</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Carbs</span>
          <span className="text-lg font-bold text-[#1A1A1A] leading-tight">{mealTypeTotals.carbohydrates.toFixed(1)} <span className="text-[12px] font-normal text-gray-500">g</span></span>
        </div>
      </div>
    )}
    <MealTypesWithOptions
      key={selectedMealType}
      selectedMealsForMealType={normalizedSelectedMealsForMealType}
    />
  </div>
}

function MealDetails({ meal }) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-gray-100 rounded-2xl h-full shadow-sm">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#F8F8F8]">
        <Image
          alt={meal.dish_name || meal.name}
          src={meal.image || "/not-found.png"}
          fill
          className="object-cover"
          onError={(e) => (e.target.src = "/not-found.png")}
        />
      </div>

      <h3 className="font-bold text-[18px] leading-tight text-[#1A1A1A]">
        {meal.dish_name || meal.name}
      </h3>

      {meal.description && (
        <p className="text-[14px] text-[#666666] leading-normal line-clamp-3">
          {meal.description}
        </p>
      )}

      <div className="mt-auto pt-4 border-t border-gray-50">
        <div className="grid grid-cols-3 gap-y-4 gap-x-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Serving</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{meal.serving_size || "1 unit"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Calories</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{meal.calories} kcal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Protein</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{meal.protein} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carbs</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{meal.carbohydrates || meal.carbs} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fats</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{meal.fats} g</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeleteCustomMealPlan({ id }) {
  const { cache } = useSWRConfig()
  const router = useRouter();
  async function deleteCustomPlan(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(`app/meal-plan/custom?id=${id}`, {}, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      cache.delete("custom-meal-plans")
      router.push("/coach/meals/list-custom")
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="Are you sure to delete this custom meal plan?"
    action={(setLoading, closeBtnRef) => deleteCustomPlan(setLoading, closeBtnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="text-[var(--accent-2)]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}

export function DisplayMealStats({ meals: { plans = {} } = {} }) {
  const allMeals = useMemo(() => {
    const arr = []
    for (const plan in plans) {
      const p = plans[plan];
      if (!p) continue;

      if (Array.isArray(p)) {
        for (const mealType of p) {
          if (Array.isArray(mealType?.meals)) {
            for (const opt of mealType.meals) {
              if (Array.isArray(opt?.dishes)) arr.push(...flattenMealPlanDishes(opt.dishes));
            }
          }
        }
        continue;
      }

      if (p.daily && typeof p.daily === "object") {
        const d = p.daily;
        if (Array.isArray(d.breakfast)) arr.push(...d.breakfast);
        if (Array.isArray(d.lunch)) arr.push(...d.lunch);
        if (Array.isArray(d.dinner)) arr.push(...d.dinner);
        if (Array.isArray(d.snacks)) arr.push(...d.snacks);
        continue;
      }
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const isWeekly = Object.keys(p).some(k => days.includes(k.toLowerCase()));

      if (isWeekly) {
        for (const day of days) {
          const dayPlan = p[day];
          if (!dayPlan) continue;

          if (Array.isArray(dayPlan.breakfast)) arr.push(...dayPlan.breakfast);
          if (Array.isArray(dayPlan.lunch)) arr.push(...dayPlan.lunch);
          if (Array.isArray(dayPlan.dinner)) arr.push(...dayPlan.dinner);
          if (Array.isArray(dayPlan.snacks)) arr.push(...dayPlan.snacks);
        }
        continue;
      }

      if (p.meals && Array.isArray(p.meals)) {
        for (const mealType of p.meals) {
          if (Array.isArray(mealType?.meals)) {
            for (const opt of mealType.meals) {
              if (Array.isArray(opt?.dishes)) arr.push(...flattenMealPlanDishes(opt.dishes));
            }
          }
        }
        continue;
      }

      if (Array.isArray(p.breakfast)) arr.push(...p.breakfast);
      if (Array.isArray(p.lunch)) arr.push(...p.lunch);
      if (Array.isArray(p.dinner)) arr.push(...p.dinner);
      if (Array.isArray(p.snacks)) arr.push(...p.snacks);
    }
    return arr;
  }, [plans])

  const totals = useMemo(() => {
    return allMeals.reduce(
      (acc, meal) => {
        const caloriesVal =
          typeof meal?.calories === "object"
            ? meal?.calories?.total
            : meal?.calories;
        const proteinVal = meal?.protein ?? meal?.calories?.proteins;
        const carbsVal = meal?.carbohydrates ?? meal?.calories?.carbs;
        const fatsVal = meal?.fats ?? meal?.calories?.fats;

        acc.calories += parseNum(caloriesVal);
        acc.protein += parseNum(proteinVal);
        acc.carbohydrates += parseNum(carbsVal);
        acc.fats += parseNum(fatsVal);
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fats: 0 }
    );
  }, [allMeals]);

  return (
    <div className="bg-white px-4 py-3 border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-x-8 gap-y-2 items-center text-sm">
        <span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest mr-2">Total Daily Intake:</span>
        <div className="flex gap-4">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#1A1A1A]">{totals.calories.toFixed(0)}</span>
            <span className="text-gray-400 text-[11px]">kcal</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#1A1A1A]">{totals.protein.toFixed(1)}</span>
            <span className="text-gray-400 text-[11px]">Prot</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#1A1A1A]">{totals.fats.toFixed(1)}</span>
            <span className="text-gray-400 text-[11px]">Fats</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#1A1A1A]">{totals.carbohydrates.toFixed(1)}</span>
            <span className="text-gray-400 text-[11px]">Carbs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseNum(val) {
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function MealTypesWithOptions({ selectedMealsForMealType = [] }) {
  return <div className="mt-6">
    <div className="space-y-8">
      {selectedMealsForMealType.map((type, idx) => <MealTypeListView
        type={type}
        key={type.optionType || idx}
      />)}
    </div>
  </div>
}

function MealTypeListView({ type }) {
  const meals = type.dishes;

  return <div className="mb-10 last:mb-0">
    <div className="flex items-center gap-3 mb-6">
      <div className="h-[2px] flex-1 bg-gray-100"></div>
      <div className="font-bold text-[15px] uppercase tracking-[0.1em] text-gray-400 px-3 py-1 bg-gray-50 rounded-full">
        {snakeCaseToTitleCase(type.optionType)}
      </div>
      <div className="h-[2px] flex-1 bg-gray-100"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
      {meals.map((meal, index) => (
        <MealDetails key={index} meal={meal} />
      ))}
      {meals?.length === 0 && <div className="h-[200px] bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-200 text-gray-400 col-span-full">
        No meals found for this option
      </div>}
    </div>
  </div>
}

function createMealPlanPdfPayload(customPlan, userDetails = {}) {
  const planData = customPlan.plans.daily;
  const planPayload = {
    "Day 1": {
      totals: {
        calories: parsePlanTotals(planData.description, 'Calories'),
        protein: parsePlanTotals(planData.description, 'Protein'),
        carbohydrates: parsePlanTotals(planData.description, 'Carbs'),
        fats: parsePlanTotals(planData.description, 'Fats')
      }
    }
  };

  planData.meals.forEach(mealGroup => {
    const type = mealGroup.mealType;
    planPayload["Day 1"][type] = {
      options: mealGroup.meals.map(opt => ({
        optionType: opt.optionType,
        dishes: flattenMealPlanDishes(opt?.dishes).map(dish => ({
          dish_name: dish.dish_name,
          description: dish.description || "",
          meal_time: dish.meal_time,
          serving_size: dish.serving_size,
          calories: dish.calories,
          protein: dish.protein,
          carbohydrates: dish.carbohydrates,
          fats: dish.fats,
          image: dish.image || ""
        }))
      }))
    };
  });
  return {
    mealPlanId: customPlan._id,
    title: customPlan.title,
    description: customPlan.description,
    mode: customPlan.mode,
    plan: planPayload,
    cover: {
      name: userDetails.name || "Valued Client",
      email: userDetails.email || "",
      dateTime: new Date().toISOString(),
      metropolisPid: userDetails.metropolisPid,
      vid: userDetails.clientId,
      contactNumber: userDetails.mobileNumber,
      gender: userDetails.gender,
      age: userDetails.age,
    },
    clientPreferences: customPlan.clientPreferences,
    foodsToEat: customPlan.foodsToEat,
    foodsToAvoid: customPlan.foodsToAvoid,
    story: customPlan.story,
    thinking: customPlan.thinking,
    nutritionBreakdown: customPlan.nutritionBreakdown,
  };
}

function parsePlanTotals(description, key) {
  console.log(description, key)
  const regex = new RegExp(`${key}:\\s*(\\d+)`, 'i');
  const match = description.match(regex);
  return match ? parseInt(match[1]) : 0;
}

function SendPDFViaWhatsapp({ clientId, pdf }) {
  async function sendMealPlanPdfViaWhatsapp() {
    try {
      const formData = new FormData()
      formData.append("clientId", clientId)
      formData.append("file", pdf)
      const response = await sendDataWithFormData("app/metropolis/whatsapp/share-pdf", formData);
      if (response.status_code !== 200) throw new Error(response.message)
      toast.success(response.message || "Successfully sent pdf.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.")
    }
  }

  return <DualOptionActionModal
    description="You are deleting the note!"
    action={(setLoading, btnRef) => sendMealPlanPdfViaWhatsapp(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <FaWhatsapp className="w-[20px] h-[20px] text-[var(--accent-1)]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}