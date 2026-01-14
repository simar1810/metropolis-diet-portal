"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendData } from "@/lib/api";

const GOALS = [
  { label: "WEIGHT LOSS", value: "Weight loss", icon: "/assets/PNG/weight.png" },
  { label: "MUSCLE BUILDING", value: "Muscle building", icon: "/assets/PNG/muscle.png" },
  { label: "LEAN BODY ( MAINTAIN PHYSIQUE )", value: "Lean body", icon: "/assets/PNG/slim.png" },
  { label: "MANAGE DIABETES", value: "Manage Diabetes", icon: "/assets/SVG/BMI.svg" },
  { label: "MANAGE PCOS", value: "Manage PCOS", icon: "/assets/SVG/body.svg" },
  { label: "MANAGE CHOLESTEROL", value: "Manage Cholesterol", icon: "/assets/SVG/fat.svg" },
  { label: "HEALTHY LIFESTYLE", value: "Healthy lifestyle", icon: "/assets/SVG/person.svg" },
];

const ACTIVITY_LEVELS = [
  { label: "ACTIVE", value: "Active" },
  { label: "SEDENTARY", value: "Sedentary" },
  { label: "SUPER ACTIVE", value: "Super Active" },
  { label: "EXTREMELY ACTIVE", value: "Extremely Active" },
  { label: "MODERATE", value: "Moderate" },
];

const HEALTH_CONDITIONS = [
  "High Blood Pressure", "Anemia", "Hypothyroidism", "Fatty Liver", "Inflammation",
  "Calcium Deficiency", "Protein Deficiency", "Vitamin D Deficiency", "Vitamin B12 Deficiency",
  "Iron Deficiency", "Diabetes", "Uric Acid Problem", "High Cholesterol / Heart",
  "Digestion / Acidity / Constipation", "Sleep Disorder", "None"
];

const ALLERGIES = [
  "Gluten Allergy", "Nut Allergy", "Egg Allergy", "Fish Allergy",
  "Milk / Lactose Allergy", "Soya Allergy", "Sea Food Allergy", "None"
];

const DIET_PREFERENCES = [
  { label: "VEGETARIAN", value: "Vegetarian", icon: "/assets/PNG/Veg.png" },
  { label: "NON-VEGETARIAN", value: "Non-Vegetarian", icon: "/assets/PNG/Non_veg.png" },
  { label: "EGG + VEGETARIAN", value: "Egg + Vegetarian", icon: "/assets/PNG/Eggetarian.png" },
  { label: "VEGAN", value: "Vegan", icon: "/assets/PNG/Veg.png" },
];

export default function EditClientPreferences({ clientId, clientPreferences = {} }) {
  const [payload, setPayload] = useState({
    clientId: clientId,
    preferences: {
      height: "",
      weight: "",
      bloodGroup: "",
      dietPreference: "",
      activityLevel: "",
      sleepHours: "",
      stressLevel: "",
      medicalConditions: "",
      allergies: "",
      smoking: "",
      alcoholConsumption: "",
      fitnessGoal: "",
      waterIntake: "",
      mentalWellbeing: "",
      energyLevel: "",
      ...clientPreferences
    }
  });

  useEffect(() => {
    setPayload(prev => ({
      ...prev,
      clientId: clientId,
      preferences: { ...prev.preferences, ...clientPreferences }
    }));
  }, [clientId, clientPreferences]);

  const [currentStage, setCurrentStage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleUpdatePreference = (key, value) => {
    setPayload(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const prevStage = () => setCurrentStage(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Updating preferences...");
    try {
      const response = await sendData("app/metropolis/customer/relation", payload, "PUT");
      if (response && response.status_code === 200) {
        toast.success(response.message || "Preferences updated successfully", { id: toastId });
        setOpen(false);
      } else {
        toast.error(response?.message || "Failed to update preferences", { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred while updating preferences", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-[var(--accent-1)] font-semibold text-sm cursor-pointer">Edit</button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-[500px] bg-white text-black overflow-hidden border-none outline-none max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-y-auto">
        <div className="flex flex-col h-full relative">
          <div className="p-6 bg-[#00984A] text-white flex items-center gap-4 shrink-0">
            {currentStage > 1 && (
              <button onClick={prevStage} className="hover:bg-white/10 p-1 rounded-full transition-colors cursor-pointer">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <DialogTitle className="text-lg font-bold leading-tight">
              {currentStage === 1 && "Please Select your primary health goal/concern from the following"}
              {currentStage === 2 && "How Often do you Exercise ?"}
              {currentStage === 3 && "Check All that Implies"}
              {currentStage === 4 && "Give us your Diet Preferences"}
            </DialogTitle>
          </div>

          <ScrollArea className="flex-1 px-6">
            <div className="py-6">
              {currentStage === 1 && (
                <GoalStage
                  selected={payload.preferences.fitnessGoal}
                  onSelect={(val) => handleUpdatePreference("fitnessGoal", val)}
                />
              )}
              {currentStage === 2 && (
                <ActivityStage
                  selected={payload.preferences.activityLevel}
                  onSelect={(val) => handleUpdatePreference("activityLevel", val)}
                />
              )}
              {currentStage === 3 && (
                <ConditionsStage
                  medicalConditions={payload.preferences.medicalConditions}
                  allergies={payload.preferences.allergies}
                  onChange={handleUpdatePreference}
                />
              )}
              {currentStage === 4 && (
                <DietStatsStage
                  preferences={payload.preferences}
                  onChange={handleUpdatePreference}
                />
              )}
            </div>
          </ScrollArea>

          <div className="p-6 pt-2 bg-white shrink-0">
            {currentStage < 4 ? (
              <Button
                className="w-full bg-[#00984A] hover:bg-[#00803d] text-white rounded-xl py-6 text-lg font-bold shadow-md"
                onClick={() => setCurrentStage(prev => prev + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                className="w-full bg-black hover:bg-black/90 text-white rounded-xl py-6 text-lg font-bold shadow-md"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoalStage({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {GOALS.map((goal) => (
        <button
          key={goal.value}
          onClick={() => onSelect(goal.value)}
          className={cn(
            "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer aspect-square",
            selected === goal.value
              ? "bg-[#E6E24C] border-[#E6E24C] text-black scale-[1.02]"
              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
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
  );
}

function ActivityStage({ selected, onSelect }) {
  return (
    <div className="flex flex-col items-center pt-2">
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
    </div>
  );
}

function ConditionsStage({ medicalConditions, allergies, onChange }) {
  const currentConditions = useMemo(() => medicalConditions?.split(", ").filter(Boolean) || [], [medicalConditions]);
  const currentAllergies = useMemo(() => allergies?.split(", ").filter(Boolean) || [], [allergies]);

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
    onChange(key, newList.join(", "));
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
    </div>
  );
}

function DietStatsStage({ preferences, onChange }) {
  const [heightUnit, setHeightUnit] = useState(() => {
    if (preferences.height?.toLowerCase().includes("ft") || preferences.height?.includes("'")) return "ft/in";
    return "cm";
  });
  const [weightUnit, setWeightUnit] = useState(() => {
    if (preferences.weight?.toLowerCase().includes("lbs") || preferences.weight?.toLowerCase().includes("pounds")) return "lbs";
    return "kg";
  });

  // Update preferences when unit changes
  const toggleHeightUnit = (unit) => {
    setHeightUnit(unit);
    const value = preferences.height?.replace(/[^\d.'"]/g, "").trim();
    if (value) onChange("height", `${value} ${unit}`);
  };

  const toggleWeightUnit = (unit) => {
    setWeightUnit(unit);
    const value = preferences.weight?.replace(/[^\d.]/g, "").trim();
    if (value) onChange("weight", `${value} ${unit}`);
  };

  // Extract numeric values for display
  const heightValue = useMemo(() => {
    return preferences.height?.replace(/[^\d.'"]/g, "").trim() || "";
  }, [preferences.height]);

  const weightValue = useMemo(() => {
    return preferences.weight?.replace(/[^\d.]/g, "").trim() || "";
  }, [preferences.weight]);

  const handleHeightChange = (val) => {
    onChange("height", `${val} ${heightUnit}`);
  };

  const handleWeightChange = (val) => {
    onChange("weight", `${val} ${weightUnit}`);
  };

  return (
    <div className="space-y-6 pt-1">
      <div className="grid grid-cols-2 gap-3">
        {DIET_PREFERENCES.map((diet) => (
          <button
            key={diet.value}
            onClick={() => onChange("dietPreference", diet.value)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer aspect-square",
              preferences.dietPreference === diet.value
                ? "bg-[#E6E24C] border-[#E6E24C] text-black scale-[1.02]"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            )}
          >
            {preferences.dietPreference === diet.value && (
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
    </div>
  );
}
