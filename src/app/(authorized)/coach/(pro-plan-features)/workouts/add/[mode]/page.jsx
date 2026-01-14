"use client"
import ContentError from "@/components/common/ContentError";
import Stage2 from "@/components/pages/coach/workouts/add/Stage2";
import { customWorkoutIS, customWorkoutReducer, selectWorkoutType } from "@/config/state-reducers/custom-workout";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  return <CurrentStateProvider
    state={customWorkoutIS("new")}
    reducer={customWorkoutReducer}
  >
    <CustomMealPlanContainer />
  </CurrentStateProvider>
}

function CustomMealPlanContainer() {
  const { mode } = useParams()
  const { dispatch } = useCurrentStateContext()

  useEffect(function () {
    if (["daily", "weekly", "monthly"].includes(mode)) {
      dispatch(selectWorkoutType(mode))
    }
  }, [])
  if (!["daily", "weekly", "monthly"].includes(mode)) return <ContentError title="Invalid Creation Mode selected" />
  return <div className="content-container content-height-screen">
    <Stage2 />
  </div>
}