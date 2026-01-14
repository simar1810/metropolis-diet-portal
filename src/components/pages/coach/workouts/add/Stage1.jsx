import { Button } from "@/components/ui/button";
import { selectWorkoutType } from "@/config/state-reducers/custom-workout";
import { cn } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { CalendarRange } from "lucide-react";
import { useState } from "react";

export default function Stage1() {
  const { mode } = useCurrentStateContext();
  const [selected, setSelected] = useState(() => mode);
  const { dispatch } = useCurrentStateContext();
  return <div className="content-height-screen max-w-[600px] mx-auto flex flex-col items-center justify-center">
    <div className="text-center mt-8 grid grid-cols-3 gap-4">
      <button
        className={cn("bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]", selected === "daily" && "bg-white border-2 scale-[1.05]")}
        onClick={() => setSelected("daily")}
      >
        <CalendarRange className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-4 rounded-full" fill="#00984A" />
        Daily Workout
      </button>
      <button
        className={cn("bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]", selected === "weekly" && "bg-white border-2 scale-[1.05]")}
        onClick={() => setSelected("weekly")}
      >
        <CalendarRange className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-4 rounded-full" fill="#00984A" />
        Weekly Workout
      </button>
      <button
        className={cn("bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]", selected === "monthly" && "bg-white border-2 scale-[1.05]")}
        onClick={() => setSelected("monthly")}
      >
        <CalendarRange className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-4 rounded-full" fill="#00984A" />
        Custom Routine Workout
      </button>
    </div>
    <Button
      className="mt-8"
      variant="wz"
      onClick={() => dispatch(selectWorkoutType(selected))}
    >Next</Button>
  </div>
}