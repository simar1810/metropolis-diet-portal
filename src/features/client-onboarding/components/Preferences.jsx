import { cn } from "@/lib/utils";
import { DIET_PREFERENCES } from "../state/config";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import NextButton from "./NextButton";
import { createRequestPayload, updateDetails } from "../state/client-onboarding-reducer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertHeight, convertWeight } from "../state/lib";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Preferences() {
  const {
    dietPreferences: defaultPreferences,
    height: defaultHeight,
    weight: defaultWeight,
    heightUnit: defaultHeightUnit,
    weightUnit: defaultWeightUnit,
    dispatch,
    ...state
  } = useCurrentStateContext()
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [height, handleHeightChange] = useState(defaultHeight)
  const [weight, handleWeightChange] = useState(defaultWeight)
  const [heightUnit, setHeightUnit] = useState(() => {
    if (defaultHeightUnit?.toLowerCase().includes("ft") || defaultHeightUnit?.includes("'")) return "ft/in";
    return "cm";
  });
  const [weightUnit, setWeightUnit] = useState(() => {
    if (defaultWeightUnit?.toLowerCase().includes("lbs") || defaultWeightUnit?.toLowerCase().includes("pounds")) return "lbs";
    return "kg";
  });

  const toggleHeightUnit = (changeUnit) => {
    if (changeUnit === heightUnit) return
    const { value, unit } = convertHeight(
      height,
      changeUnit === "cm" ? "ft/in" : "cm"
    )
    handleHeightChange(value)
    setHeightUnit(unit)
  }

  const toggleWeightUnit = (changeUnit) => {
    if (changeUnit === weightUnit) return
    const { value, unit } = convertWeight(
      weight,
      changeUnit === "kg" ? "lbs" : "kg"
    )
    handleWeightChange(String(value));
    setWeightUnit(unit);
  };

  const heightValue = useMemo(() => {
    return height?.replace(/[^\d.'"]/g, "").trim() || "";
  }, [height]);

  const weightValue = useMemo(() => {
    return weight?.replace(/[^\d.]/g, "").trim() || "";
  }, [weight]);

  async function createUser() {
    try {
      const customCreationToastId = toast.loading("Creating Customer")

      const preferencesData = createRequestPayload({
        ...state,
        preferences,
        height,
        heightUnit,
        weight,
        weightUnit,
      })

      const createCustomerResponse = await sendData(
        "app/metropolis/new-client",
        {
          firstName: state.firstName,
          name: state.lastName,
          mobileNumber: state.mobileNumber,
          preferences: preferencesData
        }
      )
      toast.dismiss(customCreationToastId)
      if (createCustomerResponse.status_code !== 200) throw new Error(createCustomerResponse.message)
      window.location.href = "/coach/clients"
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    }
  }

  return (
    <div className="space-y-6 pt-1">
      <div className="grid grid-cols-2 gap-3">
        {DIET_PREFERENCES.map((diet) => (
          <button
            key={diet.value}
            onClick={() => setPreferences(diet.value)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer aspect-square",
              preferences === diet.value
                ? "bg-[#E6E24C] border-[#E6E24C] text-black scale-[1.02]"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            )}
          >
            {preferences === diet.value && (
              <div className="absolute top-2 left-2 bg-[#E6E24C] rounded-full p-0.5 border border-[#00984A] z-20">
                <Check className="w-3 h-3 text-[#00984A]" strokeWidth={4} />
              </div>
            )}
            <div className="w-14 h-14 mb-2 flex items-center justify-center">
              <img
                src={diet.icon}
                alt={diet.label}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>
            <span className="text-[10px] font-black tracking-normal text-center leading-tight uppercase">
              {diet.label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-gray-600 font-bold text-[10px] uppercase tracking-wider">Height</Label>
              <div className="flex gap-2 text-[9px] font-bold">
                <button
                  onClick={() => toggleHeightUnit("cm")}
                  className={cn("px-1.5 py-0.5 rounded border transition-colors", heightUnit === "cm" ? "bg-[#00984A] text-white border-[#00984A]" : "bg-gray-100 text-gray-500 border-gray-200")}
                >CM</button>
                <button
                  onClick={() => toggleHeightUnit("ft/in")}
                  className={cn("px-1.5 py-0.5 rounded border transition-colors", heightUnit === "ft/in" ? "bg-[#00984A] text-white border-[#00984A]" : "bg-gray-100 text-gray-500 border-gray-200")}
                >FT/IN</button>
              </div>
            </div>
            <Input
              value={heightValue}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 h-10 rounded-lg text-sm"
              placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 5'9\""}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-gray-600 font-bold text-[10px] uppercase tracking-wider">Weight</Label>
              <div className="flex gap-2 text-[9px] font-bold">
                <button
                  onClick={() => toggleWeightUnit("kg")}
                  className={cn("px-1.5 py-0.5 rounded border transition-colors", weightUnit === "kg" ? "bg-[#00984A] text-white border-[#00984A]" : "bg-gray-100 text-gray-500 border-gray-200")}
                >KG</button>
                <button
                  onClick={() => toggleWeightUnit("lbs")}
                  className={cn("px-1.5 py-0.5 rounded border transition-colors", weightUnit === "lbs" ? "bg-[#00984A] text-white border-[#00984A]" : "bg-gray-100 text-gray-500 border-gray-200")}
                >LBS</button>
              </div>
            </div>
            <Input
              value={weightValue}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 h-10 rounded-lg text-sm"
              placeholder={weightUnit === "kg" ? "e.g. 72" : "e.g. 158"}
            />
          </div>
        </div>
      </div>
      <Button
        variant="wz"
        onClick={createUser}
      >Save</Button>
      {/* <NextButton handler={handleNext} /> */}
    </div>
  );
}