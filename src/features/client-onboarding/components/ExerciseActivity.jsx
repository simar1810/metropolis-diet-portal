import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useState } from "react";
import NextButton from "./NextButton";
import { updateDetails } from "../state/client-onboarding-reducer";
import { ACTIVITY_LEVELS } from "../state/config";
import { cn } from "@/lib/utils";
import { sendData } from "@/lib/api";

export default function ExerciseActivity() {
  const { dispatch, dailyActivity, selectedClientDetails, ...state } = useCurrentStateContext()
  const [selected, onSelect] = useState(dailyActivity)
  const [loading, setLoading] = useState(false);

  const handleNext = async function () {
    setLoading(true)
    const cdpData = {}
    try {
      const response = await sendData("app/metropolis/cdp/getProfile", {
        mobileNumber: state.mobileNumber,
        metropolisPid: selectedClientDetails?.pid,
        name: selectedClientDetails?.name || selectedClientDetails?.firstName
      })
      console.log(response)
      if (Array.isArray(response?.others)) {
        cdpData.medicalConditions = response?.others.join(", ")
      }
    } catch (error) { }
    dispatch(updateDetails({
      dailyActivity: selected,
      medicalConditions: `${state.medicalConditions}, ${cdpData.medicalConditions}` || "",
      stage: "conditions-allergies"
    }))
    setLoading(false)
  }
  return <div className="flex flex-col items-center pt-2">
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {ACTIVITY_LEVELS.map((level) => (
        <button
          key={level.value}
          onClick={() => onSelect(level.value)}
          className={cn(
            "px-4 py-1.5 rounded-full border text-[11px] font-bold tracking-wider transition-all cursor-pointer uppercase",
            selected === level.value
              ? "bg-[#E6E24C] border-[#E6E24C] text-black"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
          )}
        >
          {level.label}
        </button>
      ))}
    </div>
    <p className="text-center text-[#00984A] font-bold text-base">
      {selected ? `Level: ${selected}` : "Select a level to continue."}
    </p>
    <NextButton disabled={loading} handler={handleNext} />
  </div>
}