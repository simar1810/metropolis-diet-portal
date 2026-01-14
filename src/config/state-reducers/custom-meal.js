import { addDays, format, isBefore, parse } from "date-fns";
import { customMealInitialState } from "../state-data/custom-meal";
import { DAYS } from "../data/ui";

const BASE_MEAL_TYPES = [
  "when_you_wake_up",
  "before_breakfast",
  "breakfast",
  "mid_day_meal",
  "lunch",
  "post_lunch_snack",
  "evening_snack",
  "dinner",
  "after_dinner",
  "before_sleep",
];

function createDefaultOption(optionType = "option_1") {
  return { optionType, dishes: [] };
}

export const defaultMealTypes = BASE_MEAL_TYPES.map((mealType) => ({
  mealType,
  meals: [createDefaultOption()],
  defaultMealTiming: "",
}));

export const createDefaultMealTypes = () =>
  defaultMealTypes.map(({ mealType, defaultMealTiming }) => ({
    mealType,
    meals: [createDefaultOption()],
    defaultMealTiming: defaultMealTiming ?? "",
  }));

function deleteDeep(obj, path) {
  if (!path || path.length === 0) return obj;

  const [head, ...tail] = path;

  if (path.length === 1) {
    if (Array.isArray(obj)) {
      // Remove item at index, filtering out undefined/null if any? No, just index filter.
      return obj.filter((_, i) => i !== head);
    }
    if (typeof obj === "object" && obj !== null) {
      // Remove key
      const newObj = { ...obj };
      delete newObj[head];
      return newObj;
    }
    return obj;
  }

  // Recursive step
  if (Array.isArray(obj)) {
    return obj.map((item, i) => (i === head ? deleteDeep(item, tail) : item));
  }

  if (typeof obj === "object" && obj !== null) {
    // If the key doesn't exist, return obj as is
    if (!(head in obj)) return obj;

    return {
      ...obj,
      [head]: deleteDeep(obj[head], tail),
    };
  }

  return obj;
}

function updateDeep(obj, path, updater) {
  if (!path || path.length === 0) return updater(obj);

  const [head, ...tail] = path;

  if (Array.isArray(obj)) {
    return obj.map((item, i) => i === head ? updateDeep(item, tail, updater) : item);
  }

  if (typeof obj === "object" && obj !== null) {
    // If key doesn't exist, we assume it's valid for traversal or returns unchanged if not found? 
    // For safety, only update if key exists or if we want to add? but updates usually target existing.
    if (head in obj) {
      return {
        ...obj,
        [head]: updateDeep(obj[head], tail, updater)
      };
    }
    return obj;
  }

  return obj;
}

export function customMealReducer(state, action) {
  switch (action.type) {
    case "SELECT_MEAL_TYPE":
      if (action.payload === "daily") return {
        ...state,
        stage: 2,
        mode: "daily",
        creationType: "new",
        selectedPlan: "daily",
        selectedMealType: defaultMealTypes[0]?.mealType,
        selectedPlans: {
          daily: createDefaultMealTypes(),
        },
      }
      else if (action.payload === "weekly") return {
        ...state,
        stage: 2,
        mode: "weekly",
        creationType: "new",
        selectedPlan: "sun",
        selectedMealType: defaultMealTypes[0]?.mealType,
        selectedPlans: DAYS.reduce((acc, curr) => {
          acc[curr] = createDefaultMealTypes();
          return acc;
        }, {}),
      }
      return {
        ...state,
        stage: 2,
        mode: "monthly",
        creationType: "new",
        selectedPlan: format(new Date(), 'dd-MM-yyyy'),
        selectedMealType: defaultMealTypes[0]?.mealType,
        selectedPlans: {
          [format(new Date(), 'dd-MM-yyyy')]: createDefaultMealTypes(),
        },
      }

    case "INITIAL_STATE_DIFFERENT_CREATION":
      // normalize incoming plans to the new shape
      const normalizedSelectedPlans = Object.fromEntries(
        Object.entries(action.payload.selectedPlans || {}).map(([key, value]) => [
          key,
          normalizePlan(value),
        ])
      );
      return {
        ...state,
        ...action.payload,
        stage: 2,
        mode: action.payload.mode,
        creationType: action.payload.creationType,
        selectedPlan: action.payload.selectedPlan,
        selectedPlans: normalizedSelectedPlans,
        editPlans: action.payload.editPlans
      }
    case "CUSTOM_MEAL_UPDATE_FIELD":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "CHANGE_MEAL_PLAN":
      return {
        ...state,
        plans: {
          ...state.plans,
          [action.payload.day]: action.payload.plan._id
        },
        selectedPlans: {
          ...state.selectedPlans,
          [action.payload.day]: action.payload.plan
        }
      }
    case "REMOVE_MEAL_TO_PLAN":
      delete state.plans[action.payload]
      delete state.selectedPlans[action.payload]
      return {
        ...state
      };
    case "SELECT_PLAN_TYPE":
      return {
        ...state,
        selectedPlan: action.payload
      }
    case "SELECT_MEAL_PLAN_TYPE":
      return {
        ...state,
        selectedOption: "option_1",
        selectedMealType: action.payload,
      }
    case "CHANGE_SELECTED_PLAN":
      const plan = normalizePlan(state.selectedPlans[action.payload]);
      const selectMeal = plan?.at(0)?.mealType;
      return {
        ...state,
        selectedPlan: action.payload,
        selectedMealType: selectMeal,
        selectedPlans: {
          ...state.selectedPlans,
          [action.payload]: plan,
        }
      }
    case "SAVE_MEAL_TYPE": {
      const currentPlan = normalizePlan(state.selectedPlans[state.selectedPlan]);
      const currentMeals = currentPlan;

      if (action.payload.type === "new") {
        const updatedMeals = [
          ...currentMeals,
          {
            mealType: action.payload.mealType,
            meals: [createDefaultOption()],
            defaultMealTiming: "",
          },
        ];

        return {
          ...state,
          selectedPlans: {
            ...state.selectedPlans,
            [state.selectedPlan]: updatedMeals,
          },
          selectedMealType: action.payload.mealType,
        };
      }

      if (action.payload.type === "edit") {
        const updatedMeals = currentMeals.map((mealPlan, index) =>
          index === action.payload.index
            ? { ...mealPlan, mealType: action.payload.mealType }
            : mealPlan
        );

        return {
          ...state,
          selectedPlans: {
            ...state.selectedPlans,
            [state.selectedPlan]: updatedMeals,
          },
          selectedMealType: action.payload.mealType,
        };
      }
      const updatedMeals = currentMeals.filter(
        (_, index) => index !== action.payload.index
      );
      const newSelectedMealType =
        updatedMeals.at(updatedMeals.length - 1)?.mealType || "";

      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: updatedMeals,
        },
        selectedMealType: newSelectedMealType,
      };
    }
    case "SAVE_RECIPE": {
      const { recipe, index, isNew, optionType } = action.payload || {};
      const currentPlan = normalizePlan(state.selectedPlans[state.selectedPlan]);
      const mealTypeIndex = currentPlan.findIndex(
        (mealType) => mealType?.mealType === state.selectedMealType
      );
      if (mealTypeIndex === -1) return state;

      const selectedMealTypeEntry = normalizeMealTypeEntry(currentPlan[mealTypeIndex]);

      const mealTypeDefaultTiming =
        typeof selectedMealTypeEntry?.defaultMealTiming === "string" &&
          selectedMealTypeEntry.defaultMealTiming.length > 0
          ? selectedMealTypeEntry.defaultMealTiming
          : undefined;

      const firstMealTiming =
        Array.isArray(selectedMealTypeEntry?.meals) &&
          selectedMealTypeEntry.meals.length > 0 &&
          typeof selectedMealTypeEntry.meals[0]?.dishes?.[0]?.time === "string"
          ? selectedMealTypeEntry.meals[0]?.dishes?.[0]?.time
          : undefined;

      const defaultMealTiming = mealTypeDefaultTiming ?? firstMealTiming ?? "";

      const normalizedDish = normalizeDishPayload(
        recipe,
        {
          defaultTime: defaultMealTiming,
          keepIsNew: Boolean(isNew),
        }
      );

      const targetOptionType = optionType || state.selectedOption || "option_1";
      const options = ensureOptionEntry(selectedMealTypeEntry.meals, targetOptionType);
      const optionIndex = options.findIndex(opt => opt.optionType === targetOptionType);
      const option = options[optionIndex];

      let updatedOptions;

      // Determine effective path
      let effectivePath = undefined;
      // If index is an object with path { path: [...] }
      if (index && typeof index === 'object' && index.path) effectivePath = index.path;
      // If index is the path array itself (from Add button)
      else if (Array.isArray(index)) effectivePath = index;

      if (effectivePath) {
        updatedOptions = options.map((opt, i) =>
          i === optionIndex
            ? {
              ...opt,
              dishes: updateDeep(opt.dishes, effectivePath, (target) => {
                // If target is an Array, we are appending (Adding new item)
                if (Array.isArray(target)) {
                  return [...target, normalizedDish];
                }
                // If target is an Object (and not null), we are Updating the existing item
                if (typeof target === "object" && target !== null) {
                  return { ...target, ...normalizedDish };
                }
                // Fallback (shouldn't happen for valid paths)
                return target;
              }),
            }
            : opt
        );
      } else if (index || index === 0) {
        updatedOptions = options.map((opt, i) =>
          i === optionIndex
            ? {
              ...opt,
              dishes: opt.dishes.map((dish, dishIdx) =>
                dishIdx === index ? { ...dish, ...normalizedDish } : dish
              ),
            }
            : opt
        );
      } else {
        updatedOptions = options.map((opt, i) =>
          i === optionIndex
            ? {
              ...opt,
              dishes: [
                ...opt.dishes,
                normalizedDish
              ],
            }
            : opt
        );
      }

      const updatedMeals = currentPlan.map((mealType, idx) =>
        idx === mealTypeIndex
          ? { ...mealType, meals: updatedOptions }
          : mealType
      );

      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: updatedMeals,
        },
      };
    }
    case "DELETE_RECIPE": {
      const payload = action.payload;
      const path = typeof payload === "object" && Array.isArray(payload?.path) ? payload.path : undefined;
      const deleteIndex = typeof payload === "object" ? payload?.index : payload;
      const optionType = typeof payload === "object" ? payload?.optionType : undefined;

      if (typeof deleteIndex !== "number" && !path) return state;

      const currentPlan = normalizePlan(state.selectedPlans[state.selectedPlan]);
      const currentMeals = currentPlan;
      const targetOptionType = optionType || state.selectedOption;

      const updatedMeals = currentMeals.map((mealType) =>
        mealType.mealType === state.selectedMealType
          ? {
            ...mealType,
            meals: mealType.meals.map((opt) => opt.optionType === targetOptionType ? ({
              ...opt,
              dishes: path
                ? deleteDeep(opt.dishes, path)
                : opt.dishes.filter((_, index) => index !== deleteIndex),
            }) : opt),
          }
          : mealType
      );

      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: updatedMeals,
        },
      };
    }
    case "MEAL_PLAN_CREATED":
      return {
        ...state,
        plans: {
          [action.payload.type]: action.payload.value
        }
      }

    case "ADD_NEW_PLAN_TYPE":
      const formatted = format(parse(action.payload, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");

      // Find default timings from existing dates
      // Collect all default timings for each meal type across all dates
      const defaultTimingsMap = {};
      const existingDates = Object.keys(state.selectedPlans);

      if (existingDates.length > 0) {
        // Collect default timings from all existing dates
        existingDates.forEach(date => {
          const plan = state.selectedPlans[date];
          const meals = Array.isArray(plan) ? plan : plan?.meals || [];

          meals.forEach(meal => {
            if (meal?.mealType && typeof meal?.defaultMealTiming === "string" && meal.defaultMealTiming.length > 0) {
              const mealType = meal.mealType;
              // Use the first non-empty default timing found for each meal type
              // This ensures we get the default timing that was set via SetMealTimingsDialog
              if (!defaultTimingsMap[mealType]) {
                defaultTimingsMap[mealType] = meal.defaultMealTiming;
              }
            }
          });
        });
      }

      // Create meal types with default timings if available
      const newMealTypes = createDefaultMealTypes().map(mealType => ({
        ...mealType,
        defaultMealTiming: defaultTimingsMap[mealType.mealType] || mealType.defaultMealTiming
      }));

      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [formatted]: newMealTypes
        },
        selectedPlan: formatted,
        selectedMealType: "Breakfast"
      }

    case "COPY_ALL_MEAL_PLANS":
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [action.payload.to]: state.selectedPlans[action.payload.from]
        }
      }

    case "COPY_MEAL_REPLACE_DESTINATIONS": {
      const { replacements = [] } = action.payload || {};
      if (!Array.isArray(replacements) || replacements.length === 0) return state;

      const updatedPlans = { ...state.selectedPlans };

      replacements.forEach(({ fromPlan, fromMealIndex, toPlan, toMealType }) => {
        if (!fromPlan || typeof fromMealIndex !== "number" || !toPlan) return;

        const sourcePlan = state.selectedPlans[fromPlan];
        const sourceMealsArray = Array.isArray(sourcePlan)
          ? sourcePlan
          : sourcePlan?.meals || [];

        const sourceMealEntry = sourceMealsArray[fromMealIndex];
        if (!sourceMealEntry) return;

        const normalizedMealType = toMealType || sourceMealEntry?.mealType || sourceMealEntry?.fromMealType;
        if (!normalizedMealType) return;

        const mealsToCopy = Array.isArray(sourceMealEntry?.meals)
          ? sourceMealEntry.meals.map((meal) => ({ ...meal }))
          : [];

        const targetPlan = updatedPlans[toPlan] || [];
        const targetIsArray = Array.isArray(targetPlan);
        const targetMealsArray = targetIsArray ? targetPlan : targetPlan?.meals || [];

        const targetIndex = targetMealsArray.findIndex((meal) => meal.mealType === normalizedMealType);

        const nextMealsArray = targetIndex >= 0
          ? targetMealsArray.map((meal, index) =>
            index === targetIndex
              ? {
                ...meal,
                mealType: normalizedMealType,
                meals: mealsToCopy,
              }
              : meal,
          )
          : [
            ...targetMealsArray,
            {
              mealType: normalizedMealType,
              meals: mealsToCopy,
              defaultMealTiming:
                (typeof sourceMealEntry?.defaultMealTiming === "string" &&
                  sourceMealEntry.defaultMealTiming.length > 0
                  ? sourceMealEntry.defaultMealTiming
                  : undefined) ?? "",
            },
          ];

        updatedPlans[toPlan] = targetIsArray
          ? nextMealsArray
          : {
            ...targetPlan,
            meals: nextMealsArray,
          };
      });
      // return state
      return {
        ...state,
        selectedPlans: updatedPlans,
      }
    }

    case "DELETE_MONTHLY_DATE":
      delete state.selectedPlans[action.payload]
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
        }
      }
    case "CHANGE_MONTHLY_DATE":
      const {
        selectedPlans: {
          [action.payload.prev]: previous,
          ...selectedPlans
        },
        ...rest
      } = state;
      return {
        ...rest,
        selectedPlans: {
          ...selectedPlans,
          [action.payload.new]: previous
        },
        selectedPlan: action.payload.new,
      };
    case "LOAD_AI_MEAL_PLAN": {
      const ai = action.payload.mealPlan;

      return {
        ...state,
        title: ai.title,
        description: ai.description,
        guidelines: ai.guidelines,
        supplements: ai.supplements,
        mode: ai.mode || "daily",
        creationType: "new",
        stage: 2,
        selectedPlan: "daily",
        selectedMealType:
          ai.plan?.day_1?.meals?.[0]?.mealType || "Breakfast",
        selectedPlans: Object.fromEntries(
          Object.entries(ai.plan || {}).map(([day, data]) => [
            day,
            {
              ...data,
              meals: Array.isArray(data.meals) ? data.meals : [],
            },
          ])
        ),
        isAiGenerated: true,
      };
    }
    case "REORDER_MEAL_TYPES": {
      const { oldIndex, newIndex } = action.payload;
      const currentPlan = normalizePlan(state.selectedPlans[state.selectedPlan]);
      const currentMeals = currentPlan;

      if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= currentMeals.length || newIndex >= currentMeals.length) {
        return state;
      }

      const reorderedMeals = [...currentMeals];
      const [movedMeal] = reorderedMeals.splice(oldIndex, 1);
      reorderedMeals.splice(newIndex, 0, movedMeal);

      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: reorderedMeals,
        },
      };
    }

    case "START_FROM_TODAY": {
      if (state.mode !== "monthly") return state

      const totalAddedDays = Object
        .keys(state.selectedPlans)

      const sortedDateKeys = sortDatesByKeys(totalAddedDays)

      const newPlans = {}
      let current = 0;
      const now = new Date();

      for (const date of sortedDateKeys) {
        newPlans[format(
          addDays(now, current),
          "dd-MM-yyyy"
        )] = state.selectedPlans[date]
        current++;
      }
      return {
        ...state,
        selectedPlans: newPlans,
        selectedPlan: format(now, "dd-MM-yyyy"),
        selectedMealType: newPlans[
          format(now, "dd-MM-yyyy")
        ][0].mealType
      }
    }

    case "CHANGE_OPTION_TYPE":
      return {
        ...state,
        selectedOption: action.payload
      }

    default:
      return state;
  }
}

function normalizePlan(plan) {
  if (Array.isArray(plan)) {
    return plan.map(normalizeMealTypeEntry);
  }

  if (plan?.meals && Array.isArray(plan.meals)) {
    return plan.meals.map(normalizeMealTypeEntry);
  }

  // Legacy keyed object (breakfast/lunch/etc.)
  if (plan && typeof plan === "object") {
    const keys = ["breakfast", "lunch", "dinner", "snacks"];
    const mealTypes = [];
    keys.forEach((key) => {
      const dishes = plan[key];
      if (Array.isArray(dishes) && dishes.length > 0) {
        mealTypes.push({
          mealType: key,
          meals: [{ optionType: "option_1", dishes }],
          defaultMealTiming: "",
        });
      }
    });
    if (mealTypes.length > 0) return mealTypes.map(normalizeMealTypeEntry);
  }

  return [];
}

function normalizeMealTypeEntry(entry) {
  if (!entry) return { mealType: "", meals: [createDefaultOption()], defaultMealTiming: "" };
  const mealType = entry.mealType || entry.type || "";
  const defaultMealTiming = entry.defaultMealTiming || "";

  const mealsRaw = Array.isArray(entry.meals) ? entry.meals : [];
  const meals = mealsRaw.map((opt, idx) => ({
    optionType: opt?.optionType || opt?.type || `option_${idx + 1}`,
    dishes: Array.isArray(opt?.dishes)
      ? opt.dishes
      : Array.isArray(opt?.meals)
        ? opt.meals
        : [],
  }));

  return {
    mealType,
    meals: meals.length > 0 ? meals : [createDefaultOption()],
    defaultMealTiming,
  };
}

function ensureOptionEntry(options = [], optionType = "option_1") {
  const normalized = Array.isArray(options) ? options : [];
  const hasOption = normalized.some((opt) => opt.optionType === optionType);
  if (hasOption) return normalized;
  return [...normalized, { optionType, dishes: [] }];
}

function normalizeDishPayload(recipe = {}, { defaultTime = "", keepIsNew = false } = {}) {
  return {
    ...recipe,
    dish_name: recipe.dish_name || recipe.title || recipe.name || "",
    image: recipe.image || recipe.img || "",
    fats: recipe.fats ?? recipe?.calories?.fats ?? "",
    calories: recipe?.calories?.total ?? recipe.calories ?? "",
    protein: recipe.protein ?? recipe?.calories?.proteins ?? "",
    carbohydrates: recipe.carbohydrates ?? recipe?.calories?.carbs ?? "",
    measure: recipe.measure,
    isNew: keepIsNew,
    time: recipe.time ?? defaultTime ?? "",
  };
}

export function selectWorkoutType(payload) {
  return {
    type: "SELECT_MEAL_TYPE",
    payload
  }
}

export function customWorkoutUpdateField(name, value) {
  return {
    type: "CUSTOM_MEAL_UPDATE_FIELD",
    payload: {
      name,
      value
    }
  }
}

export function changeWorkoutPlans(day, plan) {
  return {
    type: "CHANGE_MEAL_PLAN",
    payload: {
      day,
      plan
    }
  }
}

export function removeWorkoutFromPlans(payload) {
  return {
    type: "REMOVE_MEAL_TO_PLAN",
    payload
  }
}

export function selectMealPlanType(payload) {
  return {
    type: "SELECT_MEAL_PLAN_TYPE",
    payload
  }
}

export function changeSelectedPlan(payload) {
  return {
    type: "CHANGE_SELECTED_PLAN",
    payload
  }
}

export function saveMealType(mealType, type, index) {
  return {
    type: "SAVE_MEAL_TYPE",
    payload: {
      mealType,
      type,
      index
    }
  }
}

export function saveRecipe(recipe, index, isNew, optionType) {
  return {
    type: "SAVE_RECIPE",
    payload: {
      recipe,
      index,
      isNew,
      optionType
    }
  }
}

export function exportRecipe(payload, optionType) {
  return {
    type: "DELETE_RECIPE",
    payload: typeof payload === "object"
      ? payload
      : { index: payload, optionType }
  }
}

export function mealPlanCreated(type, value) {
  return {
    type: "MEAL_PLAN_CREATED",
    payload: {
      type,
      value
    }
  }
}

export function addNewPlanType(payload) {
  return {
    type: "ADD_NEW_PLAN_TYPE",
    payload
  }
}

export function customMealIS(type, state) {
  if (type === "new") {
    return customMealInitialState;
  } else {
    return {
      ...customMealInitialState
    }
  }
}

export function changeStateDifferentCreationMeal(payload) {
  return {
    type: "INITIAL_STATE_DIFFERENT_CREATION",
    payload
  }
}

export function copyAllMealPlans(from, to) {
  return {
    type: "COPY_ALL_MEAL_PLANS",
    payload: {
      from, to
    }
  }
}

export function replaceMealPlanSelections(replacements) {
  return {
    type: "COPY_MEAL_REPLACE_DESTINATIONS",
    payload: {
      replacements,
    },
  }
}

export function mealPlanCreationRP(state) {
  return {
    name: undefined,
    description: undefined,
    joiningDate: undefined,
    // _id: undefined,
    notes: undefined,
    image: undefined,
    meals: state.map(item => ({ mealType: item.mealType, meals: item.meals }))
  }
}

export function dailyMealRP(state) {
  return {
    title: state.title,
    description: state.description,
    guidelines: state.guidelines,
    supplements: state.supplements,
    mode: state.mode,
    image: state.image,
    ...(state.mode === "monthly" && { noOfDays: state.noOfDays })
  }
}

export function weeklyMealRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: state.plans
  }
}

export function monthlyMealRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: payload
  }
}

export function changeMonthlyDate(payload) {
  return {
    type: "CHANGE_MONTHLY_DATE",
    payload
  }
}

export function deleteMonthlyDate(payload) {
  return {
    type: "DELETE_MONTHLY_DATE",
    payload
  }
}

export function reorderMealTypes(oldIndex, newIndex) {
  return {
    type: "REORDER_MEAL_TYPES",
    payload: {
      oldIndex,
      newIndex
    }
  }
}

export function startFromToday() {
  return {
    type: "START_FROM_TODAY"
  }
}

function sortDatesByKeys(dates) {
  return dates
    .map(date => parse(date, "dd-MM-yyyy", new Date()))
    .sort((dateA, dateB) => isBefore(dateA, dateB) ? -1 : 1)
    .map(date => format(date, "dd-MM-yyyy"))
}

export function getRecipeId(recipe) {
  return recipe._id?.$oid ?? recipe._id
}

export function changeTheMealOptionType(payload) {
  return {
    type: "CHANGE_OPTION_TYPE",
    payload
  }
}