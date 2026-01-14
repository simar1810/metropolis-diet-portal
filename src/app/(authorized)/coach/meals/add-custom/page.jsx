"use client";
import Stage1 from "@/components/pages/coach/meal-plan/add/Stage1";
import Stage2 from "@/components/pages/coach/meal-plan/add/Stage2";
import MetropolisNotesSticky from "@/components/common/MetropolisNotesSticky";
import { changeStateDifferentCreationMeal, customMealIS, customMealReducer, selectWorkoutType } from "@/config/state-reducers/custom-meal";
import { getCustomMealPlans } from "@/lib/fetchers/app";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  return <div className="content-container mt-0">
    <CurrentStateProvider
      state={customMealIS("new")}
      reducer={customMealReducer}
    >
      <CustomWorkoutContainer />
    </CurrentStateProvider>
  </div>
}

const defaultNutrients = {
  calories: 1800,
  proteins: 400,
  carbohydrates: 250,
  fats: 300,
}

function CustomWorkoutContainer() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode")
  const creationType = searchParams.get("creationType");
  const mealId = searchParams.get("mealId")
  const router = useRouter();

  const { dispatch, stage } = useCurrentStateContext();
  const Component = selectCreationStage(stage)
  const [notesClient, setNotesClient] = useState(null);

  useEffect(function () {
    ; (async function () {
      if (["edit", "copy_edit"].includes(creationType) && Boolean(mealId)) {
        const response = await getCustomMealPlans("coach", mealId)
        if (response.status_code !== 200) {
          toast.error(response.message);
          router.push("/coach/meals/list-custom");
        }
        const mealPlan = Array.isArray(response.data) ? response.data[0] : response.data
        const plans = {};
        const editPlans = {}
        for (const field in mealPlan.plans) {
          plans[field] = normalizePlanForState(mealPlan.plans[field])
          editPlans[field] = mealPlan.plans[field]._id
        }
        const client = mealPlan?.clients?.at(0);
        setNotesClient(client ? { id: client?._id, notes: client?.metropolisNotes } : null);
        dispatch(changeStateDifferentCreationMeal({
          mode,
          creationType,
          selectedPlans: plans,
          editPlans: editPlans,
          selectedPlan: Object.keys(plans)?.at(0),
          selectedMealType: Object.values(plans)?.at(0)?.at(0)?.mealType,
          image: mealPlan.image,
          thumbnail: mealPlan.image,
          title: mealPlan.title,
          description: mealPlan.description,
          guidelines: mealPlan.guidelines,
          supplements: mealPlan.supplements,
          id: mealPlan._id,
          noOfDays: mealPlan.noOfDays,
          totals: defaultNutrients,
          aiResponseRaw: mealPlan.aiResponseRaw,
        }))
      } else if (["daily", "weekly", "monthly"].includes(mode)) {
        dispatch(selectWorkoutType(mode))
      }
    })();
  }, [])

  return (
    <div className="space-y-4">
      {["edit", "copy_edit"].includes(creationType) && Boolean(mealId) && notesClient?.id && (
        <MetropolisNotesSticky
          clientId={notesClient.id}
          defaultValue={notesClient.notes}
          title="Metropolis Notes"
          onSaved={(newNote) => setNotesClient((prev) => (prev ? { ...prev, notes: newNote } : prev))}
        />
      )}
      {Component}
    </div>
  );
}

function selectCreationStage(stage) {
  switch (stage) {
    case 1:
      return <Stage1 />
    case 2:
      return <Stage2 />
    default:
      break;
  }
}

function normalizePlanForState(plan) {
  if (Array.isArray(plan)) return plan;
  if (plan?.meals && Array.isArray(plan.meals)) return plan.meals;
  if (plan && typeof plan === "object") {
    const keys = ["breakfast", "lunch", "dinner", "snacks"];
    const meals = [];
    keys.forEach((key) => {
      if (Array.isArray(plan[key]) && plan[key].length > 0) {
        meals.push({
          mealType: key,
          meals: [{ optionType: "option_1", dishes: plan[key] }],
          defaultMealTiming: "",
        });
      }
    });
    return meals;
  }
  return [];
}