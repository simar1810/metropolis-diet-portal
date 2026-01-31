import { cn } from "@/lib/utils";
import { ALLERGIES, HEALTH_CONDITIONS } from "../state/config";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useState } from "react";
import { Check } from "lucide-react";
import NextButton from "./NextButton";
import { updateDetails } from "../state/client-onboarding-reducer";

export default function ConditionsAllergies() {
  const {
    dispatch,
    medicalConditions,
    allergies
  } = useCurrentStateContext()
  const [currentConditions, setCurrentConditions] = useState(medicalConditions);
  const [currentAllergies, setCurrentAllergies] = useState(allergies);

  const handleNext = function () {
    dispatch(updateDetails({
      allergies: currentAllergies,
      medicalConditions: currentConditions,
      stage: "preferences"
    }))
  }

  const toggleItem = (list, item, key) => {
    let newList;
    if (item === "None") {
      newList = ["None"];
    } else {
      const filtered = list.filter(i => i !== "None");
      if (filtered.includes(item)) {
        newList = filtered.filter(i => i !== item);
      } else {
        newList = [...filtered, item];
      }
    }
    if (key === "medicalConditions") {
      setCurrentConditions(newList)
    } else {
      setCurrentAllergies(newList)
    }
  };

  return (
    <div className="space-y-6 pt-1">
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-[#00984A] font-black text-xs mb-4 tracking-wide uppercase">Health Condition</h3>
        <div className="grid grid-cols-1 gap-y-3">
          {HEALTH_CONDITIONS.map(item => (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                currentConditions.includes(item) ? "bg-[#E6E24C] border-[#E6E24C] scale-105" : "border-gray-300 bg-white"
              )}>
                {currentConditions.includes(item) && <Check className="w-3 h-3 text-[#00984A]" strokeWidth={4} />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={currentConditions.includes(item)}
                onChange={() => toggleItem(currentConditions, item, "medicalConditions")}
              />
              <span className="text-[13px] font-bold text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-[#00984A] font-black text-xs mb-4 tracking-wide uppercase">Allergies</h3>
        <div className="grid grid-cols-1 gap-y-3">
          {ALLERGIES.map(item => (
            <label key={item} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                currentAllergies.includes(item) ? "bg-[#E6E24C] border-[#E6E24C] scale-105" : "border-gray-300 bg-white"
              )}>
                {currentAllergies.includes(item) && <Check className="w-3 h-3 text-[#00984A]" strokeWidth={4} />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={currentAllergies.includes(item)}
                onChange={() => toggleItem(currentAllergies, item, "allergies")}
              />
              <span className="text-[13px] font-bold text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>
      <NextButton handler={handleNext} />
    </div>
  );
}