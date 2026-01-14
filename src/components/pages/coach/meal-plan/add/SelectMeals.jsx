import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { exportRecipe, reorderMealTypes, saveRecipe, selectMealPlanType } from "@/config/state-reducers/custom-meal";
import { cn, snakeCaseToTitleCase } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Minus, Move, Pen, PlusCircle } from "lucide-react";
import { useState } from "react";
import EditSelectedMealDetails from "./EditSelectedMealDetails";
import SaveMealType from "./SaveMealType";

export default function SelectMeals() {
  const {
    dispatch,
    selectedPlans,
    selectedMealType,
    selectedPlan
  } = useCurrentStateContext();

  const [activeId, setActiveId] = useState(null);

  const rawPlan = selectedPlans[selectedPlan];
  const plan = Array.isArray(rawPlan) ? rawPlan : rawPlan?.meals ?? [];

  const mealTypes = plan.map(m => m.mealType);
  const selectedMealTypeRecipee = plan.find(m => m.mealType === selectedMealType)?.meals || [];
  const errorMessage = !mealTypes
    ? "Please select a date"
    : mealTypes?.length === 0 && "Please select a Type!";

  const currentMeals = plan || [];
  const activeMeal = activeId ? currentMeals.find(m => m.mealType === activeId) : null;

  function onSortMeals(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = currentMeals.findIndex(m => m.mealType === active.id);
    const newIndex = currentMeals.findIndex(m => m.mealType === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      dispatch(reorderMealTypes(oldIndex, newIndex));
    }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  return <div>
    <div className="pt-4 flex gap-4 overflow-x-auto pb-4 items-center">
      {(!mealTypes || mealTypes?.length === 0) && <div className="bg-[var(--comp-1)] border-1 p-2 rounded-[6px] grow text-center mr-auto"
      >
        {errorMessage}
      </div>}
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={onSortMeals}
      >
        <SortableContext items={mealTypes || []}>
          {currentMeals.map((mealEntry, index) => (
            <SortableMealType
              key={mealEntry.mealType}
              index={index}
              type={mealEntry.mealType}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId && activeMeal
            ? <MealTypeButton
              type={activeMeal.mealType}
              isSelected={activeMeal.mealType === selectedMealType}
            />
            : null}
        </DragOverlay>
      </DndContext>
      <SaveMealType type="new" />
    </div>
    <div className="mt-2 flex flex-col gap-4">
      {selectedMealTypeRecipee.map(item => <MealTypeListingView
        mealType={item}
        key={item.optionType}
      />)}
    </div>
  </div>
}

function SortableMealType({ type, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: type,
  });

  const { dispatch, selectedMealType } = useCurrentStateContext()

  const isSelected = type === selectedMealType;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : (transition || "transform 200ms ease"),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      <div className="relative">
        <Button
          variant={isSelected ? "wz" : "outline"}
          onClick={() => dispatch(selectMealPlanType(type))}
          className="pr-6 pl-8 font-bold whitespace-nowrap"
          disabled={isDragging}
        >
          {snakeCaseToTitleCase(type)}
        </Button>
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute left-[6px] top-1/2 translate-y-[-50%] flex items-center justify-center w-5 h-5 rounded cursor-grab active:cursor-grabbing",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "transition-colors duration-150",
            "touch-none select-none z-10"
          )}
          title="Drag to reorder"
        >
          <Move
            className={cn(
              "w-3.5 h-3.5",
              isSelected ? "text-white/70" : "text-[var(--accent-1)]/70"
            )}
            strokeWidth={2}
          />
        </div>
        <SaveMealType
          type="edit"
          index={index}
          defaulValue={type}
        >
          <DialogTrigger className="absolute top-1/2 translate-y-[-50%] right-[6px] cursor-pointer z-10" asChild>
            <Pen className={cn("w-[14px] h-[14px]", isSelected ? "text-white" : "text-[var(--accent-1)]")} />
          </DialogTrigger>
        </SaveMealType>
      </div>
    </div>
  );
}

function MealTypeButton({ type, isSelected }) {
  return (
    <div className="relative">
      <Button
        variant={isSelected ? "wz" : "outline"}
        className="pr-6 pl-8 font-bold whitespace-nowrap shadow-xl opacity-95"
      >
        {type}
      </Button>
    </div>
  );
}

function MealTypeListingView({ mealType }) {
  const { dispatch } = useCurrentStateContext();
  const optionType = mealType?.optionType || "option_1";
  const dishes = Array.isArray(mealType?.dishes) ? mealType.dishes : [];
  const label = snakeCaseToTitleCase(optionType);
  const hasDishes = dishes.length > 0;

  // Helper function to check if an object is a dish (has dish-like properties)
  const isDishObject = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    return "dish_name" in obj || "description" in obj || "calories" in obj;
  };

  // Helper function to check if this is a nested structure object
  const isNestedStructure = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    const keys = Object.keys(obj);
    // Check if keys contain patterns like "choose_any", "roti", "base", etc.
    return keys.some(key =>
      key.includes("choose") ||
      key === "roti" ||
      key === "base" ||
      key.includes("raita") ||
      key.includes("curd") ||
      key === "items" // for combo structures
    );
  };

  // Recursive function to render dishes, handling nested structures
  const renderDishes = (dishData, path) => {
    // If it's a simple dish object, render it
    if (isDishObject(dishData)) {
      // Create a unique key based on the path
      const uniqueKey = path.join("-");
      // Use the last element of the path as the index for display purposes if it's a number
      const displayIndex = typeof path[path.length - 1] === 'number' ? path[path.length - 1] : 0;

      return (
        <div key={uniqueKey} className="flex items-center gap-4">
          <EditSelectedMealDetails
            key={uniqueKey}
            index={displayIndex}
            path={path}
            recipe={dishData}
            optionType={optionType}
            defaultOpen={dishData.isNew || false}
          />
          {/* <Minus
            className="bg-[var(--accent-2)] text-white cursor-pointer ml-auto rounded-full px-[2px]"
            strokeWidth={3}
            onClick={() => dispatch(exportRecipe({ path, optionType }))}
          /> */}
        </div>
      );
    }

    // If it's a nested structure object (like lunch/dinner with salad_choose_any_1, etc.)
    if (isNestedStructure(dishData)) {
      // Use the index from the path if available, or a fallback
      const nestedKey = path.length > 0 ? path.join("-") : "root";

      return (
        <div key={`nested-${nestedKey}`} className="space-y-4 pl-4 border-l-2 border-gray-200">
          {Object.entries(dishData).map(([key, value]) => {
            const sectionLabel = snakeCaseToTitleCase(key);

            // Handle arrays (choose options)
            if (Array.isArray(value)) {
              return (
                <div key={`${uniqueId}-${key}-section`} className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                    <h4 className="text-sm font-medium text-gray-700">
                      {sectionLabel}
                    </h4>
                    <PlusCircle
                      className="w-4 h-4 text-[var(--accent-1)] cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => dispatch(saveRecipe({}, [...path, key], true, optionType))}
                    />
                  </div>
                  <div className="space-y-2">
                    {value.map((item, idx) => {
                      // Check if item has nested items (for combo structure)
                      if (item.items && Array.isArray(item.items)) {
                        return (
                          <div key={`${key}-${idx}`} className="space-y-2 pl-2 border-l border-blue-200">
                            <span className="text-xs text-blue-600 font-medium">Combo {idx + 1}</span>
                            {item.items.map((comboItem, comboIdx) =>
                              renderDishes(comboItem, [...path, key, idx, 'items', comboIdx])
                            )}
                          </div>
                        );
                      }
                      return renderDishes(item, [...path, key, idx]);
                    })}
                  </div>
                </div>
              );
            }

            // Handle single dish objects (like roti, raita)
            if (isDishObject(value)) {
              return (
                <div key={`${uniqueId}-${key}-single`} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">
                    {sectionLabel}
                  </h4>
                  {renderDishes(value, [...path, key])}
                </div>
              );
            }

            return null;
          })}
        </div>
      );
    }

    // If it's none of the above, return null
    return null;
  };

  const uniqueId = mealType._id || Math.random().toString(36).substr(2, 9);

  return (
    <div className="border-1 rounded-[8px] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{label}</h3>
      </div>
      <div className="mt-3 space-y-3">
        {hasDishes ? dishes.map((recipe, index) => (
          <div key={`dish-container-${index}`}>
            {renderDishes(recipe, [index])}
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">No dishes added yet.</p>
        )}
      </div>
      {/* <Button
        onClick={() => dispatch(saveRecipe({}, undefined, true, optionType))}
        className="bg-transparent hover:bg-transparent w-full h-[120px] border-1 mt-4 flex items-center justify-center rounded-[8px]"
      >
        <PlusCircle className="min-w-[32px] min-h-[32px] text-[var(--accent-1)]" />
      </Button> */}
    </div>
  );
}