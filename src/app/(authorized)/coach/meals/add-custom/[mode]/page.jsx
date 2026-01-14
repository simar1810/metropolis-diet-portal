"use client"
import ContentError from "@/components/common/ContentError";
import Stage2 from "@/components/pages/coach/meal-plan/add/Stage2";
import { customMealIS, customMealReducer, selectWorkoutType } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  return <CurrentStateProvider
    state={customMealIS("new")}
    reducer={customMealReducer}
  >
    <CustomMealPlanContainer />
  </CurrentStateProvider>
}

function CustomMealPlanContainer() {
  const { mode } = useParams()
  const { dispatch, ...state } = useCurrentStateContext()
  useEffect(function () {
    if (["daily", "weekly", "monthly"].includes(mode)) {
      dispatch(selectWorkoutType(mode))
    }
    const aiData = localStorage.getItem("aiMealPlan");
    if (aiData) {
      const parsed = JSON.parse(aiData);
      dispatch({ type: "LOAD_AI_MEAL_PLAN", payload: parsed });
    }
  }, [])
  if (!["daily", "weekly", "monthly"].includes(mode)) return <ContentError title="Invalid Creation Mode selected" />
  return <div className="content-container content-height-screen">
    <Stage2 />
  </div>
}