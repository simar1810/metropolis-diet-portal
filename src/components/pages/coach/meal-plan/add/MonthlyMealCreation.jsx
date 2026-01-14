import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addNewPlanType, changeMonthlyDate, customWorkoutUpdateField, deleteMonthlyDate, startFromToday } from "@/config/state-reducers/custom-meal";
import { cn } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Dialog } from "@radix-ui/react-dialog";
import { addDays, format, isBefore, parse } from "date-fns";
import { Pen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import MealPlanActionsMenu from "./MealPlanActionsMenu";

export default function MonthlyMealCreation() {
  const { dispatch, selectedPlans, selectedPlan } = useCurrentStateContext();
  const searchParams = useSearchParams();
  const creationType = searchParams.get("creationType");
  const canStartFromToday = ["copy_edit", "edit"].includes(creationType);

  const days = Object
    .keys(selectedPlans)
    .sort((dateA, dateB) => {
      return isBefore(
        parse(dateA, "dd-MM-yyyy", new Date()),
        parse(dateB, "dd-MM-yyyy", new Date()),
      ) ? -1 : 1
    });

  const nextDate = useMemo(
    () => findNextDate(Object.keys(selectedPlans)),
    [Object.keys(selectedPlans)]
  )

  return <>
    <div className="flex items-center justify-between gap-2">
      <h3 className="mr-auto">Days</h3>
      <MealPlanActionsMenu
        toPlan={selectedPlan}
        showStartFromToday={canStartFromToday}
        onStartFromToday={() => dispatch(startFromToday())}
      />
    </div>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-4">
      {days.length === 0 && <div className="bg-[var(--comp-1)] border-1 p-2 rounded-[6px] grow text-center mr-auto"
      >
        Please select a date
      </div>}
      {days.map((day, index) => {
        const parsedDate = parse(day, "dd-MM-yyyy", new Date());
        const formattedDate = format(parsedDate, "EEE, dd MMM");
        
        return <div
          key={index}
          className={cn(
            "pr-4 flex items-center gap-0 rounded-[10px] border-1 border-[var(--accent-1)]",
            selectedPlan === day && "bg-[var(--accent-1)]"
          )}
        >
          <Button
            variant={selectedPlan === day ? "wz" : "wz_outline"}
            onClick={() => dispatch(customWorkoutUpdateField("selectedPlan", day))}
            className="border-0"
          >
            {formattedDate}
          </Button>
        <UpdateDate
          defaultValue={day}
        />
      </div>
      })}
      <Button
        onClick={() => dispatch(addNewPlanType(nextDate))}
        variant="wz">
        Add
      </Button>
      {/* <AddDayModal /> */}
    </div>
  </>
}

const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/

function UpdateDate({ defaultValue = "" }) {
  const [value, setValue] = useState(
    regex.test(defaultValue)
      ? format(parse(defaultValue, "dd-MM-yyyy", new Date()), "yyyy-MM-dd")
      : "")
  const { dispatch } = useCurrentStateContext();

  const closeRef = useRef();

  return <Dialog>
    <DialogTrigger asChild>
      <button className="p-2 hover:bg-[var(--comp-1)] rounded transition-colors">
        <Pen
          className="w-[14px] h-[14px]"
        />
      </button>
    </DialogTrigger>
    <DialogContent className="p-0 max-w-md">
      <DialogTitle className="p-4 border-b-1 text-lg font-semibold">Update Date</DialogTitle>
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Date</label>
          <Input
            placeholder="Update Date"
            type="date"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="wz"
            onClick={() => {
              if (!value) return;
              dispatch(changeMonthlyDate({
                prev: defaultValue,
                new: format(parse(value, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
              }))
              closeRef.current.click();
            }}
            className="flex-1"
          >Save</Button>
          <Button
            variant="destructive"
            onClick={() => {
              dispatch(deleteMonthlyDate(defaultValue));
              closeRef.current.click();
            }}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
      <DialogClose ref={closeRef} />
    </DialogContent>
  </Dialog>
}

function findNextDate(keys) {
  return format(
    addDays(
      keys
        .map(date => parse(date, "dd-MM-yyyy", new Date()))
        .sort((dateA, dateB) => isBefore(dateB, dateA) ? -1 : 1)
        ?.at(0),
      1
    ),
    "yyyy-MM-dd"
  )
}