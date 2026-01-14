
import { useEffect, useMemo, useRef, useState } from "react";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useCopyMealPlan, { CopyMealPlansContext } from "@/providers/copy-meal-plan/CopyMealPlansProvider";
import {
  addCopySourceSlot,
  duplicateCopySlot,
  initCopyPayload,
  removeCopySlot,
  resetCopySelections,
  setCopySourcePlan,
  updateSlotDate,
  updateSlotMealType,
  updateSlotSourceMeal,
  updateSlotSourcePlan,
} from "@/providers/copy-meal-plan/reducer";
import { defaultMealTypes, replaceMealPlanSelections } from "@/config/state-reducers/custom-meal";
import { format, getDaysInMonth, parse } from "date-fns";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SaveMealType from "./SaveMealType";

export default function CopyMealPlanDays({ trigger, open, onOpenChange }) {
  const { selectedPlans, selectedPlan, mode } = useCurrentStateContext();
  const planKeys = Object.keys(selectedPlans ?? {});
  const safeSelectedPlan = selectedPlans?.[selectedPlan] ? selectedPlan : planKeys[0] ?? "";
  const triggerNode = trigger ?? (
    <Button
      variant="wz"
    >Copy Recipes</Button>
  );

  return <Dialog open={open} onOpenChange={onOpenChange}>
    {triggerNode && (
      <DialogTrigger asChild>
        {triggerNode}
      </DialogTrigger>
    )}
    <DialogContent className="!max-w-4xl p-0 overflow-hidden max-h-[80vh] overflow-y-auto">
      <div className="border-b px-6 py-4">
        <DialogTitle className="text-lg font-semibold text-gray-900">Copy Meal</DialogTitle>
      </div>
      <CopyMealPlansContext
        initialState={initCopyPayload({
          selectedPlan: safeSelectedPlan,
          selectedMeals: selectedPlans?.[safeSelectedPlan] ?? [],
        })}
      >
        <Container />
      </CopyMealPlansContext>
    </DialogContent>
  </Dialog>
}

const ADD_NEW_MEAL_TYPE_VALUE = "__add_new_meal_type__";


function Container() {
  const {
    dispatch: copyDispatch,
    selectedMeals: selectedMealsToDisplay,
    selectedPlan: sourcePlan,
    initialSnapshot,
  } = useCopyMealPlan()
  const { selectedPlans, dispatch: mealPlanDispatch } = useCurrentStateContext();
  const planDays = Object.keys(selectedPlans ?? {});
  const closeRef = useRef();

  const handleAddSourceSlot = (planKey) => {
    copyDispatch(addCopySourceSlot({
      plan: planKey,
      planMeals: selectedPlans?.[planKey] ?? [],
    }));
  }

  useEffect(() => {
    if (!sourcePlan && planDays.length) {
      const fallbackPlan = planDays[0];
      copyDispatch(setCopySourcePlan(fallbackPlan, selectedPlans?.[fallbackPlan] ?? []));
    }
  }, [copyDispatch, planDays, selectedPlans, sourcePlan]);

  const handleReplaceMeals = () => {
    const replacements = selectedMealsToDisplay
      .flatMap((slot) => {
        if (!slot.sourcePlan) return [];
        if (typeof slot.sourceMealIndex !== "number" || Number.isNaN(slot.sourceMealIndex)) return [];

        const targetDates = Array.isArray(slot.toDate)
          ? slot.toDate.filter(Boolean)
          : typeof slot.toDate === "string" && slot.toDate
            ? [slot.toDate]
            : [];

        if (!targetDates.length) return [];

        const mealType = slot.toMealType || slot.fromMealType;
        if (!mealType) return [];

        return targetDates.map((toPlan) => ({
          fromPlan: slot.sourcePlan,
          fromMealIndex: slot.sourceMealIndex,
          toPlan,
          toMealType: mealType,
        }));
      });

    if (!replacements.length) return;

    mealPlanDispatch(replaceMealPlanSelections(replacements));
    closeRef.current.click();
  }

  const isReplaceDisabled = !selectedMealsToDisplay.some((slot) => {
    const hasValidMealIndex = typeof slot.sourceMealIndex === "number" && !Number.isNaN(slot.sourceMealIndex);
    const selectedDates = Array.isArray(slot.toDate)
      ? slot.toDate.filter(Boolean)
      : typeof slot.toDate === "string" && slot.toDate
        ? [slot.toDate]
        : [];

    return (
      slot.sourcePlan
      && hasValidMealIndex
      && selectedDates.length > 0
      && (slot.toMealType || slot.fromMealType)
    );
  });

  return <div className="px-6 pt-0 py-5">
    <DialogClose ref={closeRef} />
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-gray-700" htmlFor="copy-from-day">
          Copy From
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Select
          value={sourcePlan || (planDays.length ? planDays[0] : undefined)}
          onValueChange={(value) => {
            copyDispatch(setCopySourcePlan(value, selectedPlans?.[value] ?? []));
          }}
          disabled={!planDays.length}
        >
          <SelectTrigger id="copy-from-day" className="min-w-[180px]">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {planDays.length === 0 && <SelectItem value="day-1">Day 1</SelectItem>}
            {planDays.map((day) => (
              <SelectItem key={day} value={day}>{day.at(0)?.toUpperCase() + day.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          key={`add-slot-${selectedMealsToDisplay.length}`}
          onValueChange={handleAddSourceSlot}
          disabled={!planDays.length}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="Add copy from slot" />
          </SelectTrigger>
          <SelectContent>
            {!planDays.length && (
              <SelectItem disabled value="__no-plans">No plans available</SelectItem>
            )}
            {planDays.map((day) => (
              <SelectItem key={day} value={day}>
                {typeof day === "string"
                  ? day.at(0)?.toUpperCase() + day.slice(1)
                  : day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="destructive"
          onClick={() => copyDispatch(resetCopySelections(initialSnapshot))}
        >
          Reset
        </Button>
      </div>
    </div>

    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center
                    bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Copy From Meal(s)</span>
        <span>Copy to Meal(s)</span>
        <span>Copy to Date(s)</span>
      </div>
      {selectedMealsToDisplay.length > 0
        ? <div className="divide-y">
          {selectedMealsToDisplay.map((slot, index) => {
            const previousSlot = index > 0 ? selectedMealsToDisplay[index - 1] : null;
            return (
              <div key={slot.id}>
                {previousSlot && (
                  <CopyDatesFromPreviousRow
                    fromSlot={previousSlot}
                    toSlot={slot}
                    dispatch={copyDispatch}
                  />
                )}
                <CopyMealPlanSlot
                  slot={slot}
                  dispatch={copyDispatch}
                />
              </div>
            );
          })}
        </div>
        : <div className="px-4 py-6 text-sm text-muted-foreground">
          No copy slots yet. Use "Add copy from slot" to choose meal sources.
        </div>}
    </div>
    <div className="flex flex-wrap items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
      <Button
        variant="wz"
        className="min-w-[150px]"
        disabled={isReplaceDisabled}
        onClick={handleReplaceMeals}
      >
        Replace
      </Button>
    </div>
  </div>
}

function CopyDatesFromPreviousRow({ fromSlot, toSlot, dispatch }) {
  const normalizeDates = (slot) => {
    if (!slot) return [];
    if (Array.isArray(slot.toDate)) return slot.toDate.filter(Boolean);
    if (typeof slot.toDate === "string" && slot.toDate) return [slot.toDate];
    return [];
  };

  const sourceDates = normalizeDates(fromSlot);
  const hasSourceDates = sourceDates.length > 0;

  const formatMealTypeLabel = (mealType) => {
    if (!mealType || typeof mealType !== "string") return "above meal";
    return mealType.at(0)?.toUpperCase() + mealType.slice(1);
  };

  const handleCopyDates = () => {
    if (!hasSourceDates) return;
    dispatch(updateSlotDate(toSlot.id, sourceDates));
  };

  return (
    <div className="flex justify-end bg-gray-50 px-4 pt-2 pb-1 text-xs">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleCopyDates}
        disabled={!hasSourceDates}
      >
        Copy dates from {formatMealTypeLabel(fromSlot?.fromMealType)}
      </Button>
    </div>
  );
}

function CopyMealPlanSlot({ slot, dispatch }) {
  const { selectedPlans, mode, selectedPlan } = useCurrentStateContext();

  const possibleModeDays = useMemo(
    () => possiblePlayDaysForCustomMeal(mode, selectedPlan) ?? [],
    [mode, selectedPlan],
  );

  const planDays = Object.keys(selectedPlans ?? {});
  const planMeals = Array.isArray(selectedPlans?.[slot.sourcePlan])
    ? selectedPlans[slot.sourcePlan]
    : [];
  const [isAddMealTypeOpen, setIsAddMealTypeOpen] = useState(false);
  const [customMealTypes, setCustomMealTypes] = useState([]);
  const boundedMealIndex = planMeals.length
    ? Math.min(Math.max(slot.sourceMealIndex ?? 0, 0), planMeals.length - 1)
    : -1;
  const currentSourceMeal = boundedMealIndex >= 0 ? planMeals[boundedMealIndex] : null;
  const canAddDestination = Boolean(slot.sourcePlan && boundedMealIndex >= 0);
  const selectedDestinationDates = Array.isArray(slot.toDate)
    ? slot.toDate
    : typeof slot.toDate === "string" && slot.toDate
      ? [slot.toDate]
      : [];

  const formatDayLabel = (value) => typeof value === "string"
    ? value.at(0)?.toUpperCase() + value.slice(1)
    : value;

  const formatMealLabel = (meal) => {
    const mealType = typeof meal === "string"
      ? meal
      : meal?.mealType ?? meal?.fromMealType ?? slot.fromMealType ?? "";
    return mealType
      ? mealType.at(0)?.toUpperCase() + mealType.slice(1)
      : "Unknown meal";
  }

  const handlePlanChange = (value) => {
    dispatch(updateSlotSourcePlan({
      id: slot.id,
      plan: value,
      planMeals: selectedPlans?.[value] ?? [],
    }));
  }

  const handleMealChange = (value) => {
    const index = Number(value);
    if (Number.isNaN(index)) return;

    dispatch(updateSlotSourceMeal({
      id: slot.id,
      mealIndex: index,
      planMeals,
    }));
  }

  const handleSlotMealTypeChange = (value) => {
    if (value === ADD_NEW_MEAL_TYPE_VALUE) {
      setIsAddMealTypeOpen(true);
      return;
    }

    dispatch(updateSlotMealType(slot.id, value));
  };

  const handleAddDestination = () => {
    if (!canAddDestination) return;

    dispatch(duplicateCopySlot({
      afterId: slot.id,
      sourcePlan: slot.sourcePlan,
      sourceMealIndex: boundedMealIndex,
      meal: currentSourceMeal,
      toDate: selectedDestinationDates,
      toMealType: slot.toMealType,
    }));
  }

  const handleRemoveSlot = () => {
    dispatch(removeCopySlot(slot.id));
  }
  return <div key={slot.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 bg-white px-4 py-3">
    <div className="grid gap-2">
      {/* <Select
        value={slot.sourcePlan || undefined}
        onValueChange={handlePlanChange}
        disabled={!planDays.length}
      >
        <SelectTrigger className="w-full justify-between">
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          {!planDays.length && (
            <SelectItem disabled value="__no-plans">No plans available</SelectItem>
          )}
          {planDays.map((day) => (
            <SelectItem key={day} value={day}>
              {formatDayLabel(day)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
      <Select
        value={boundedMealIndex >= 0 ? String(boundedMealIndex) : undefined}
        onValueChange={handleMealChange}
        disabled={!planMeals.length}
      >
        <SelectTrigger className="w-full justify-between">
          <SelectValue placeholder={planMeals.length ? "Select meal" : "No meals available"} />
        </SelectTrigger>
        <SelectContent>
          {!planMeals.length && (
            <SelectItem disabled value="__no-meals">No meals available</SelectItem>
          )}
          {planMeals.map((meal, index) => (
            <SelectItem key={`${slot.id}-${index}`} value={String(index)}>
              {formatMealLabel(meal)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleAddDestination}
          disabled={!canAddDestination}
        >
          Add Destination
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
          onClick={handleRemoveSlot}
        >
          Remove
        </Button>
      </div>
    </div>
    <Select
      value={slot.toMealType || undefined}
      onValueChange={handleSlotMealTypeChange}
      disabled={!selectedDestinationDates.length}
    >
      <SelectTrigger className="w-full justify-between">
        <SelectValue placeholder={selectedDestinationDates.length ? "Select meal" : "Select date first"} />
      </SelectTrigger>
      <SelectedSlotMealTypeOptions
        plans={selectedDestinationDates}
        sourceMealType={slot.fromMealType}
        extraMealTypes={customMealTypes}
      />
    </Select>
    <DestinationMultiSelect
      value={selectedDestinationDates}
      options={possibleModeDays}
      onChange={(dates) => dispatch(updateSlotDate(slot.id, dates))}
      formatLabel={formatDayLabel}
      placeholder="Nothing selected"
      disabled={!possibleModeDays.length}
    />
    <SaveMealType
      type="new"
      showTrigger={false}
      open={isAddMealTypeOpen}
      onOpenChange={setIsAddMealTypeOpen}
      onSave={(newMealType) => {
        const trimmed = typeof newMealType === "string" ? newMealType.trim() : newMealType;
        if (trimmed) {
          setCustomMealTypes((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
          dispatch(updateSlotMealType(slot.id, trimmed));
        }
      }}
    />
  </div>
}

function SelectedSlotMealTypeOptions({ plans, sourceMealType, extraMealTypes = [] }) {
  const { selectedPlans, selectedPlan } = useCurrentStateContext();
  const resolvedPlanKeys = Array.isArray(plans)
    ? plans.filter(Boolean)
    : typeof plans === "string" && plans
      ? [plans]
      : [];

  const extractMeals = (plan) => {
    if (!plan) return [];
    if (Array.isArray(plan)) return plan;
    if (Array.isArray(plan?.meals)) return plan.meals;
    return [];
  };

  const aggregatedMeals = resolvedPlanKeys.length > 0
    ? resolvedPlanKeys.flatMap((planKey) => extractMeals(selectedPlans?.[planKey]))
    : extractMeals(selectedPlans?.[selectedPlan]);

  const mealsSource = aggregatedMeals.length > 0 ? aggregatedMeals : defaultMealTypes;

  const uniqueMealTypes = Array.from(new Set(mealsSource.map((meal) => (typeof meal === "string"
    ? meal
    : meal?.mealType ?? meal?.fromMealType ?? "")))).filter(Boolean);

  if (sourceMealType && !uniqueMealTypes.includes(sourceMealType)) {
    uniqueMealTypes.unshift(sourceMealType);
  }

  const combinedMealTypes = Array.from(new Set([...uniqueMealTypes, ...extraMealTypes.filter(Boolean)]));

  return <SelectContent>
    {combinedMealTypes.length === 0 && (
      <SelectItem disabled value="__no-meals">No meals available</SelectItem>
    )}
    {combinedMealTypes.map((mealType) => (
      <SelectItem key={`${resolvedPlanKeys.join(",") || "default"}-${mealType}`} value={mealType}>
        {typeof mealType === "string"
          ? mealType.at(0)?.toUpperCase() + mealType.slice(1)
          : mealType}
      </SelectItem>
    ))}
    <SelectItem value={ADD_NEW_MEAL_TYPE_VALUE} className="text-primary">
      Add new meal type
    </SelectItem>
  </SelectContent>
}

function DestinationMultiSelect({
  value,
  options,
  onChange,
  formatLabel,
  placeholder = "Select options",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value)
    ? value.filter(Boolean)
    : typeof value === "string" && value
      ? [value]
      : [];

  const resolvedOptions = Array.isArray(options)
    ? options.filter(Boolean)
    : [];

  const renderLabel = (option) => {
    if (typeof formatLabel === "function") return formatLabel(option);
    return typeof option === "string"
      ? option.at(0)?.toUpperCase() + option.slice(1)
      : option;
  };

  const displayLabel = (() => {
    if (!selected.length) return placeholder;
    if (selected.length === 1) return renderLabel(selected[0]);
    return `${selected.length} selected`;
  })();

  const triggerClassName = cn(
    "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm outline-none transition-[color,box-shadow,border-color] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
    !selected.length && "text-muted-foreground",
    selected.length && "text-foreground",
  );

  const applyChange = (nextValues) => {
    if (!onChange) return;
    const unique = Array.from(new Set(nextValues.filter(Boolean)));
    // Ensure order follows options array when available
    const ordered = resolvedOptions.length
      ? [
        ...resolvedOptions.filter((option) => unique.includes(option)),
        ...unique.filter((option) => !resolvedOptions.includes(option)),
      ]
      : unique;
    onChange(ordered);
  };

  const toggleOption = (option, checked) => {
    const isChecked = checked === true || checked === "indeterminate";
    if (isChecked) {
      applyChange([...selected, option]);
    } else {
      applyChange(selected.filter((item) => item !== option));
    }
  };

  const handleSelectAll = () => applyChange(resolvedOptions);
  const handleClear = () => applyChange([]);
  const handleSelectAllClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleSelectAll();
  };
  const handleClearClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleClear();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
          disabled={disabled}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 max-h-64 overflow-y-auto"
        align="end"
      >
        {resolvedOptions.length === 0
          ? <DropdownMenuLabel className="text-xs text-muted-foreground">
            No days available
          </DropdownMenuLabel>
          : <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Select destination days
            </DropdownMenuLabel>
            <div className="flex gap-1 p-1 pt-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs flex-1"
                onClick={handleSelectAllClick}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs flex-1"
                onClick={handleClearClick}
              >
                Clear
              </Button>
            </div>
            <DropdownMenuSeparator />
            {resolvedOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selected.includes(option)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(checked) => toggleOption(option, checked)}
                className="capitalize"
              >
                {renderLabel(option)}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <div className="p-1 pt-0">
              <Button
                variant="wz"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const possiblePlayDaysForCustomMeal = function (mode, ddMMyyyy) {
  switch (mode) {
    case "weekly":
      return [
        "mon", "tue", "wed",
        "thu", "fri", "sat", "sun",
      ]
    case "monthly":
      if (!ddMMyyyy) return [];
      const date = parse(ddMMyyyy, "dd-MM-yyyy", new Date());
      if (Number.isNaN(date?.getTime?.())) return [];
      const daysInMonth = getDaysInMonth(date);
      const year = date.getFullYear();
      const month = date.getMonth();

      return Array.from({ length: daysInMonth }, (_, i) => {
        const currentDate = new Date(year, month, i + 1);
        return format(currentDate, 'dd-MM-yyyy');
      });


    default:
      return [];
  }
}
