import { differenceInYears, format, isValid, parse } from "date-fns"
import { calculateBMIFinal, calculateBMRFinal, calculateBodyFatFinal, calculateSMPFinal } from "./client/statistics"

function calcAge(data) {
  if (data?.dob?.split("-")[0]?.length === 2) return differenceInYears(new Date(), parse(data.dob, 'dd-MM-yyyy', new Date()));
  return data.age || 0
}

export function clientStatisticsPDFData(data, statistics, coach, index) {
  return {
    clientName: data.name,
    age: calcAge(data),
    bodyAge: statistics?.at(index)?.bodyAge || 0,
    gender: data.gender,
    joined: statistics?.at(index).createdDate,
    weight: statistics?.at(index).weight,
    height: `${statistics?.at(index)?.height} ${statistics?.at(index)?.heightUnit}`,
    bmi: statistics?.at(index)?.bmi || calculateBMIFinal(statistics?.at(index)),
    fatPercentage: statistics?.at(index)?.fat || calculateBodyFatFinal(statistics?.at(index)),
    musclePercentage: statistics?.at(index)?.muscle || calculateSMPFinal(statistics?.at(index)),
    restingMetabolism: statistics?.at(index)?.rm || calculateBMRFinal(statistics?.at(index)),
    bodyComposition: statistics?.at(index)?.body_composition,
    coachName: coach.name,
    coachDescription: coach.specialization,
    coachProfileImage: coach.profilePhoto
  }
}

function standardWeight({
  weightUnit,
  weight
}) {
  if (weightUnit) {
    return Number(weight);
  }
  return Number(weight) * 0.453592;
}

export function comparisonPDFData(data, statistics, coach, index) {
  return {
    clientName: data.name,
    age: data.age || 0,
    gender: data.gender,
    joined: data.joiningDate,
    weight: statistics?.at(index).weight,
    avgWeight: (statistics.reduce((acc, curr) => acc + standardWeight(curr), 0) / statistics.length).toFixed(1),
    height: `${statistics?.at(index)?.height} ${statistics?.at(index)?.heightUnit}`,
    bmi: statistics[index].bmi,
    avgBmi: (statistics.reduce((acc, curr) => acc + (Number(curr.bmi) || calculateBMIFinal(curr)), 0) / statistics.length).toFixed(1),
    rm: statistics[index].rm,
    avgRm: (statistics.reduce((acc, curr) => acc + (Number(curr.rm) || calculateBMRFinal(curr)), 0) / statistics.length).toFixed(1),
    muscle: statistics[index].muscle,
    avgMuscle: (statistics.reduce((acc, curr) => acc + (Number(curr.muscle) || calculateSMPFinal(curr)), 0) / statistics.length).toFixed(1),
    fat: statistics[index].fat,
    avgFat: (statistics.reduce((acc, curr) => acc + (Number(curr.fat) || calculateBodyFatFinal(curr)), 0) / statistics.length).toFixed(1),
    brandLogo: "/brandLogo.png",
    sideImage: "/side.png",
    bottomStripImage: "/bottom.png",
    allStatsList: statistics,
    coachName: coach.name,
    coachDescription: coach.specialization,
    coachProfileImage: coach.profilePhoto,
    coachWeightLoss: coach.weightLoss,
  }
}

export function mealPlanDetailsPDFData(plan) {
  return {
    id: plan._id,
    planName: plan.name,
    coachName: 'John Doe',
    coachDescription: 'Certified Health Coach',
    coachImage: '/coach.jpg',
    brandLogo: '/logo.png',
    mealTypes: ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'After Dinner'],
    meals: []
  }
}

function formatCustomPlanLabel(planKey, mode, explicitLabel) {
  if (explicitLabel) return explicitLabel;
  if (!planKey) return "";

  if (mode === "monthly") {
    const parsedDate = parse(planKey, "dd-MM-yyyy", new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, "LLL dd, yyyy EEE");
    }
  }

  if (mode === "weekly") {
    return planKey.charAt(0).toUpperCase() + planKey.slice(1);
  }

  if (mode === "daily") {
    return "Daily Schedule";
  }

  return planKey;
}

function normalizeMealEntries(planForDay) {
  if (!planForDay) return [];
  if (Array.isArray(planForDay)) return planForDay;
  if (Array.isArray(planForDay.meals)) return planForDay.meals;
  return [];
}

function formatMacroValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    const stringified = `${rounded}`;
    if (!stringified.includes(".")) return stringified;
    return stringified.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return formatMacroValue(numeric);
    return trimmed;
  }
  return null;
}

function resolveMacroValue(dish, key) {
  if (!dish || typeof dish !== "object") return null;

  const direct = dish[key];
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const caloriesField = dish.calories;
  if (key === "calories") {
    if (typeof caloriesField === "number" && Number.isFinite(caloriesField)) return caloriesField;
    if (typeof caloriesField === "string" && caloriesField.trim()) return caloriesField.trim();
    if (caloriesField && typeof caloriesField === "object") {
      const nested = caloriesField.total ?? caloriesField.calories ?? caloriesField.value;
      if (typeof nested === "number" && Number.isFinite(nested)) return nested;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
    return null;
  }

  if (caloriesField && typeof caloriesField === "object") {
    const nestedKeys = [key];
    if (key === "protein") nestedKeys.push("proteins");
    if (key === "carbohydrates") nestedKeys.push("carbs");
    if (key === "fats") nestedKeys.push("fat");

    for (const nestedKey of nestedKeys) {
      const nested = caloriesField[nestedKey];
      if (typeof nested === "number" && Number.isFinite(nested)) return nested;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
  }

  return null;
}

function buildMealItemsForPDF(mealEntry, { includeMacros = true, includeDescription = true } = {}) {
  if (!mealEntry) return [];
  const dishes = Array.isArray(mealEntry.meals) ? mealEntry.meals : [];

  return dishes.map((dish, index) => {
    const title = dish?.dish_name || dish?.name || dish?.title || `Item ${index + 1}`;

    const detailsParts = [];
    if (dish?.measure) detailsParts.push(dish.measure);
    if (dish?.quantity) detailsParts.push(dish.quantity);
    if (includeDescription && dish?.description) detailsParts.push(dish.description);

    if (includeMacros) {
      const macroParts = [];

      const caloriesValue = formatMacroValue(resolveMacroValue(dish, "calories"));
      const proteinValue = formatMacroValue(resolveMacroValue(dish, "protein"));
      const carbsValue = formatMacroValue(resolveMacroValue(dish, "carbohydrates"));
      const fatsValue = formatMacroValue(resolveMacroValue(dish, "fats"));

      if (caloriesValue !== null) {
        const label = typeof caloriesValue === "string" && /cal/i.test(caloriesValue)
          ? caloriesValue
          : `${caloriesValue} kcal`;
        macroParts.push(label);
      }

      if (proteinValue !== null) {
        const label = typeof proteinValue === "string" && /g\b/i.test(proteinValue)
          ? proteinValue
          : `${proteinValue}g`;
        macroParts.push(`Protein ${label}`);
      }

      if (carbsValue !== null) {
        const label = typeof carbsValue === "string" && /g\b/i.test(carbsValue)
          ? carbsValue
          : `${carbsValue}g`;
        macroParts.push(`Carbs ${label}`);
      }

      if (fatsValue !== null) {
        const label = typeof fatsValue === "string" && /g\b/i.test(fatsValue)
          ? fatsValue
          : `${fatsValue}g`;
        macroParts.push(`Fats ${label}`);
      }

      if (macroParts.length) detailsParts.push(macroParts.join(", "));
    }

    return {
      title,
      details: detailsParts.filter(Boolean).join(" | ")
    };
  });
}

export function customMealDailyPDFData(customPlan, planKey, coach, options = {}) {
  const { includeMacros = true, includeDescription = true, includeGuidelines = true, includeSupplements = true, client } = options;

  if (!customPlan || typeof customPlan !== "object") return null;

  const plansRecord = customPlan?.plans || {};
  const planEntries = Object.entries(plansRecord);
  if (planEntries.length === 0) return null;

  const generalNotesList = normalizeNotes(customPlan?.notes);
  const mealTypeOrder = [];
  const planSummaries = [];

  let selectedSummary = null;

  planEntries.forEach(([planKeyEntry, planValue]) => {
    const normalizedMeals = normalizeMealEntries(planValue);
    const planMeta = Array.isArray(planValue) ? {} : planValue || {};

    const planMeals = normalizedMeals.map((mealEntry, index) => {
      const dishes = Array.isArray(mealEntry?.meals) ? mealEntry.meals : [];
      const firstTimedDish = dishes.find(dish => dish?.meal_time);

      const mealType = mealEntry?.mealType || mealEntry?.title || `Meal ${index + 1}`;
      if (mealType && !mealTypeOrder.includes(mealType)) {
        mealTypeOrder.push(mealType);
      }

      return {
        mealType,
        timeWindow: mealEntry?.time || mealEntry?.meal_time || firstTimedDish?.meal_time || "",
        items: buildMealItemsForPDF(mealEntry, { includeMacros, includeDescription }),
        dishes,
      };
    });

    const explicitLabel = planMeta?.dateLabel || planMeta?.displayDate || planMeta?.title;
    const dateLabel = formatCustomPlanLabel(planKeyEntry, customPlan.mode, explicitLabel);
    const perPlanNotes = normalizeNotes(planMeta?.notes);

    const summary = {
      key: planKeyEntry,
      label: dateLabel,
      meals: planMeals,
      notes: perPlanNotes,
    };

    planSummaries.push(summary);

    if (planKey && planKeyEntry === planKey) {
      selectedSummary = summary;
    }
  });

  if (!planSummaries.length) return null;

  if (!selectedSummary) {
    selectedSummary = planSummaries[0];
  }

  const scheduleMeals = selectedSummary.meals.map((meal, index) => ({
    name: meal.mealType || `Meal ${index + 1}`,
    timeWindow: meal.timeWindow,
    items: meal.items,
  }));

  const selectedNotes = [
    ...selectedSummary.notes,
    ...generalNotesList,
  ].filter(Boolean);

  const uniqueMealTypes = mealTypeOrder.length
    ? mealTypeOrder
    : selectedSummary.meals.map(meal => meal.mealType).filter(Boolean);

  return {
    title: customPlan?.title || "Custom Meal Plan",
    description: includeDescription ? (customPlan?.description || "") : "",
    guidelines: includeGuidelines ? (customPlan?.guidelines || "") : "",
    supplements: includeSupplements ? (customPlan?.supplements || "") : "",
    coachName: coach?.name || "",
    clientName: client?.name || "",
    clientAge: client?.age || "",
    clientDob: client?.dob || "",
    clientEmail: client?.email || "",
    dateLabel: selectedSummary.label,
    meals: scheduleMeals,
    notes: selectedNotes.length > 0 ? selectedNotes : undefined,
    mode: customPlan?.mode || "daily",
    plans: planSummaries,
    mealTypes: uniqueMealTypes,
    selectedPlanKey: selectedSummary.key,
    generalNotes: generalNotesList,
  };
}

function normalizeNotes(notes) {
  if (Array.isArray(notes)) {
    return notes
      .map(note => (typeof note === "string" ? note.trim() : ""))
      .filter(Boolean);
  }

  if (typeof notes === "string" && notes.trim()) {
    return [notes.trim()];
  }

  return [];
}

export function invoicePDFData(order, coach) {
  const subtotal = order.productModule
    .reduce((acc, product) =>
      acc + (Number(product.quantity) * Number(product.productMrpList["0"]))
      , 0)

  return {
    clientName: order.clientName,
    age: order?.clientId?.age || '21',
    address: order?.clientId?.city ?? '',
    city: order?.clientId?.city ?? '',
    phone: order?.clientId?.mobileNumber || '',
    invoiceNo: order?.invoiceNumber || 'INVXXXXXX',
    date: order.createdAt || format(new Date(), 'dd-MM-yyyy'),
    coachName: 'Wellness Coach',
    coachPhone: '',
    coachCity: coach?.city || 'Ludhiana',
    subtotal: (order.sellingPrice * 100 * Number(coach.margin)) || "0",
    discount: 100 - Number(coach.margin), // how to get this field
    total: '3000',
    logoUrl: '/logo.png',
    products: [...order.productModule.map(product => (
      {
        productName: product.productName || "Product",
        quantity: product.quantity || 1,
        price: product?.productMrpList["50"] || 0
      })),
    { productName: 'Subtotal', quantity: "", price: subtotal },
    { productName: 'Discount', quantity: "", price: Math.abs(subtotal - (Number(order.sellingPrice) || subtotal)) },
    { productName: 'Total', quantity: "", price: order.sellingPrice || subtotal },
    ]
  }
}