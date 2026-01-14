"use client";
import ContentLoader from "@/components/common/ContentLoader";
import AddMealPlanModal from "@/components/modals/AddMealPlanModal";
import AddRecipe from "@/components/modals/AddRecipe";
import Stage2 from "@/components/pages/coach/meals/Stage2";
import { addMealPlanInitialState } from "@/config/state-data/add-meal-plan";
import { addMealPlanReducer, init } from "@/config/state-reducers/add-meal-plan";
import { fetchData } from "@/lib/api";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [dataGenerated, setDataGenerated] = useState(false);
  const [initialState, setInitialState] = useState(() => addMealPlanInitialState)
  const params = useSearchParams();

  useEffect(function () {
    if (!dataGenerated) {
      if (Boolean(params.get("id"))) {
        ; (async function () {
          try {
            const response = await fetchData(`app/get-plan-by-id?id=${params.get("id")}`);
            if (response.status_code !== 200) throw new Error(response.message);
            setInitialState(init(response.data, "edit"))
            setDataGenerated(true);
          } catch (error) {
            toast.error(error.message || "Please try again later!");
          }
        })();
      } else {
        setDataGenerated(true);
      }
    }
  }, []);

  if (!dataGenerated) return <ContentLoader />
  return <CurrentStateProvider
    state={initialState}
    reducer={addMealPlanReducer}
  >
    <AddMealPlanContainer />
  </CurrentStateProvider>
}

export function AddMealPlanContainer() {
  const { stage } = useCurrentStateContext();
  const Component = selectDisplayComponent(stage);

  return <div className="content-height-screen bg-white px-0 py-4 border-1 rounded-[10px]">
    {Component && <Component />}
  </div>
}

function selectDisplayComponent(stage) {
  switch (stage) {
    case 1:
      return AddMealPlanModal
    case 2:
      return Stage2
    case 3:
      return AddRecipe
    default:
      return undefined;
  }
}