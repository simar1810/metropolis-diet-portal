/**
 * Utilities for normalizing / rendering meal plan data.
 *
 * Some meal types (notably lunch/dinner) can contain nested structures like:
 * - salad_choose_any_1: Dish[]
 * - sabzi_choose_any_1: Dish[]
 * - combo_choose_any_1: [{ items: Dish[] }]
 * - roti: Dish
 * - low_fat_raita_or_curd: Dish
 *
 * UI screens that expect `dishes: Dish[]` need this flattened before rendering.
 */

function isDishObject(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return (
    "dish_name" in obj ||
    "meal_time" in obj ||
    "serving_size" in obj ||
    "calories" in obj ||
    "protein" in obj ||
    "carbohydrates" in obj ||
    "fats" in obj
  );
}

function collectDishObjects(node, out) {
  if (!node) return;

  if (Array.isArray(node)) {
    node.forEach((item) => collectDishObjects(item, out));
    return;
  }

  if (isDishObject(node)) {
    out.push(node);
    return;
  }

  if (typeof node === "object") {
    // Special-case: combo structures often look like { items: [...] }
    if (Array.isArray(node.items)) {
      collectDishObjects(node.items, out);
      return;
    }

    Object.values(node).forEach((value) => collectDishObjects(value, out));
  }
}

/**
 * Flattens a `dishes` array that may contain nested lunch/dinner structures into
 * a plain array of dish objects (same shape used by other meal types).
 *
 * @param {any} dishes
 * @returns {Array<object>}
 */
export function flattenMealPlanDishes(dishes) {
  const out = [];
  collectDishObjects(dishes, out);
  return out;
}


