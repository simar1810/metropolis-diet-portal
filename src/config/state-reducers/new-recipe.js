import { newRecipeInitialState } from "../state-data/new-recipe";

export function newRecipeeReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }

    default:
      return state;
  }
}

export function changeFieldvalue(name, value) {
  return {
    type: "CHANGE_FIELD_VALUE",
    payload: {
      name,
      value
    }
  }
}

export function generateRequestPayload(state) {
  const payload = new FormData();
  for (const field in state) {
    payload.append(field, state[field]);
  }
  return payload;
}

export function init(type, recipe) {
  if (type === "new") return newRecipeInitialState;
  const payload = {}
  for (const field of ["title", "ingredients", "method"]) {
    payload[field] = recipe[field]
  }
  for (const field of ["proteins", "carbs", "fats", "fibers", "total"]) {
    payload[field] = recipe.calories[field];
  }
  payload.image = recipe.image;
  payload._id = recipe._id;
  return payload
}