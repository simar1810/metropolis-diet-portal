"use client";
import IdealWeightContainer from "@/components/common/tools/IdealWeightContainer";
import { idealWeight } from "@/config/state-data/ideal-weight";
import { idealWeightReducer } from "@/config/state-reducers/ideal-weight";
import { CurrentStateProvider } from "@/providers/CurrentStateContext";

export default function Page() {
  return <CurrentStateProvider
    state={idealWeight}
    reducer={idealWeightReducer}
  >
    <IdealWeightContainer />
  </CurrentStateProvider>
}