const parseNum = function(val) {
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export const calculateAllMealCalories = function(allMeals) {
  return allMeals.reduce(
    (acc, meal) => {
      const caloriesVal =
        typeof meal?.calories === "object"
          ? meal?.calories?.total
          : meal?.calories;
      const proteinVal = meal?.protein ?? meal?.calories?.proteins;
      const carbsVal = meal?.carbohydrates ?? meal?.calories?.carbs;
      const fatsVal = meal?.fats ?? meal?.calories?.fats;

      acc.calories += parseNum(caloriesVal);
      acc.protein += parseNum(proteinVal);
      acc.carbohydrates += parseNum(carbsVal);
      acc.fats += parseNum(fatsVal);
      return acc;
    },
    { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
  );
};
