import useCurrentStateContext from "@/providers/CurrentStateContext"
import WeeklyWorkoutCreation from "./WeeklyWorkoutCreation";
import MonthlyWorkoutCreation from "./MonthlyWorkoutCreation";
import { Button } from "@/components/ui/button";
import { customWorkoutUpdateField, dailyWorkoutRP, workoutPlanCreationRP } from "@/config/state-reducers/custom-workout";
import WorkoutMetaData from "./WorkoutMetaData";
import SelectWorkouts from "./SelectWorkouts"
import React, { useState } from "react";
import { toast } from "sonner";
import { sendData, uploadImage } from "@/lib/api";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

export default function Stage2() {
  const [loading, setLoading] = useState(false);
  const { dispatch, ...state } = useCurrentStateContext();
  const component = selectWorkoutCreationComponent(state.mode);
  const { cache } = useSWRConfig();

  const router = useRouter();

  async function saveCustomWorkout() {
    try {
      for (const field of ["title", "description"]) {
        if (!Boolean(state[field])) throw new Error(`${field} - for the meal plan is required!`);
      }

      for (const plan in state.selectedPlans) {
        if (state.selectedPlans[plan].workouts?.length === 0) throw new Error(`No workouts selected for -${plan}`)
      }

      if (["new", "copy_edit"].includes(state.creationType)) {
        newWorkout();
      } else if (["edit"].includes(state.creationType)) {
        editWorkout();
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  async function editWorkout() {
    try {
      setLoading(true);

      let thumbnail;
      if (state.file) {
        const toastId = toast.loading("Uploading Thumbnail...");
        thumbnail = await uploadImage(state.file)
        dispatch(customWorkoutUpdateField("image", thumbnail.img))
        toast.dismiss(toastId);
      }

      const toastId = toast.loading("Creating The Custom Meal Plan...");
      const formData = dailyWorkoutRP(state);
      const response = await sendData(`app/workout/workout-plan/custom`, {
        ...formData,
        image: thumbnail?.img,
        plans: state.selectedPlans,
        id: state.id
      }, "PUT");
      toast.dismiss(toastId);
      if (response.status_code !== 200) throw new Error(response.message);
      cache.delete("custom-workout-plans");
      toast.success(response.message);
      router.push(`/coach/workouts/list-custom?mode=${state.mode}`);
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  async function newWorkout() {
    try {
      setLoading(true);
      const plans = {}
      for (const key in state.selectedPlans) {
        const toastId = toast.loading(`Creating Workout Plan - ${key}...`);
        const createdWorkoutPlan = await sendData("app/workout/create-custom-workout", workoutPlanCreationRP(state.selectedPlans[key]));
        if (createdWorkoutPlan.status_code !== 200) {
          toast.dismiss(toastId);
          throw new Error(createdWorkoutPlan.message)
        }
        plans[key] = createdWorkoutPlan?.data?._id
        toast.dismiss(toastId);
      }

      let thumbnail;
      if (state.file) {
        const toastId = toast.loading("Uploading Thumbnail...");
        thumbnail = await uploadImage(state.file)
        toast.dismiss(toastId);
      }

      const toastId = toast.loading("Creating The Custom Workout Plan...");
      const formData = dailyWorkoutRP(state);
      const response = await sendData(`app/workout/workout-plan/custom`, {
        ...formData,
        image: thumbnail?.img,
        plans
      });
      toast.dismiss(toastId);
      if (response.status_code !== 200) throw new Error(response.message);
      cache.delete("custom-workout-plans");
      router.push(`/coach/workouts/list-custom?mode=${state.mode}`);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return <div>
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x-2">
        <WorkoutMetaData />
        <div className="md:pl-8">
          {component}
          <SelectWorkouts />
          <Button
            disabled={loading}
            variant="wz"
            className="w-full mt-8"
            onClick={saveCustomWorkout}
          >
            Save Workout
          </Button>
        </div>
      </div>
    </div>
  </div>;
}

function selectWorkoutCreationComponent(mode) {
  switch (mode) {
    case "daily":
      return (() => <></>)();
    case "weekly":
      return <WeeklyWorkoutCreation />
    case "monthly":
      return <MonthlyWorkoutCreation />
  }
}