import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Check } from "lucide-react";
import { GOALS } from "../state/config";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NextButton from "./NextButton";
import { updateDetails } from "../state/client-onboarding-reducer";

export default function GoalStage({ }) {
  const { goal, dispatch } = useCurrentStateContext()
  const [selected, onSelect] = useState(goal)
  const handleNext = function () {
    dispatch(updateDetails({
      goal,
      stage: "gender-dob"
    }))
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onSelect(goal.value)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer aspect-square",
              selected === goal.value
                ? "bg-[#E6E24C] border-[#E6E24C] text-black scale-[1.02]"
                : "bg-[var(--accent-1)] border-gray-200 text-gray-700"
            )}
          >
            {selected === goal.value && (
              <div className="absolute top-2 left-2 bg-[#E6E24C] rounded-full p-0.5 border border-[#00984A] z-20">
                <Check className="w-3 h-3 text-[#00984A]" strokeWidth={4} />
              </div>
            )}
            <div className="w-14 h-14 mb-2 flex items-center justify-center">
              <img
                src={goal.icon}
                alt={goal.label}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>
            <span className="text-[10px] font-black tracking-normal text-center leading-tight uppercase">
              {goal.label}
            </span>
          </button>
        ))}
      </div>
      <NextButton
        handler={handleNext}
      />
    </div>
  );
}