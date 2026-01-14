"use client";
import CalorieContainer from "@/components/common/tools/CalorieContainer";
import { calorieCounterInitialState } from "@/config/state-data/calorie-counter";
import { calorieCounterReducer } from "@/config/state-reducers/calorie-counter";
import { CurrentStateProvider } from "@/providers/CurrentStateContext";

export default function Page() {
  return <CurrentStateProvider
    state={calorieCounterInitialState}
    reducer={calorieCounterReducer}
  >
    <CalorieContainer />
  </CurrentStateProvider>
}