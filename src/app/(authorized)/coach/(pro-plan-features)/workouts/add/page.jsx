"use client";
import Stage1 from "@/components/pages/coach/workouts/add/Stage1";
import Stage2 from "@/components/pages/coach/workouts/add/Stage2";
import { changeStateDifferentCreation, customWorkoutIS, customWorkoutReducer, selectWorkoutType } from "@/config/state-reducers/custom-workout";
import { getCustomWorkoutPlans } from "@/lib/fetchers/app";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  return <div className="content-container">
    <CurrentStateProvider
      state={customWorkoutIS("new")}
      reducer={customWorkoutReducer}
    >
      <CustomWorkoutContainer />
    </CurrentStateProvider>
  </div>
}

function CustomWorkoutContainer() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const creationType = searchParams.get("creationType");
  const workoutId = searchParams.get("workoutId");

  const router = useRouter();

  const { dispatch, stage } = useCurrentStateContext();
  const Component = selectCreationStage(stage);

  useEffect(function () {
    ; (async function () {
      if (["edit", "copy_edit"].includes(creationType) && Boolean(workoutId)) {
        const response = await getCustomWorkoutPlans("coach", workoutId)
        if (response.status_code !== 200) {
          toast.error(response.message);
          router.push("/coach/workouts/list-custom");
        }
        const workout = response.data[0];
        const plans = {};
        for (const field in workout.plans) {
          plans[field] = workout.plans[field].workouts || []
        }
        dispatch(changeStateDifferentCreation({
          mode,
          creationType,
          selectedPlans: workout.plans,
          selectedPlan: Object.keys(workout.plans)?.at(0),
          thumbnail: workout.image,
          title: workout.title,
          description: workout.description,
          id: workout._id
        }));
      } else if (["daily", "weekly", "monthly"].includes(mode)) {
        dispatch(selectWorkoutType(mode));
      }
    })();
  }, [])

  return Component;
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