export function calorieCounterReducer(state, action) {
  switch (action.type) {
    case "UPDATE_SEARCH_QUERY":
      return {
        ...state,
        query: action.payload
      }

    case "UPDATE_SELECTED_RECIPES":
      const length = state.selected.length
      const selected = state.selected.filter(recipe => recipe !== action.payload);
      if (selected.length === length) selected.push(action.payload)
      return {
        ...state,
        selected
      }

    case "UPDATE_VIEW":
      if (state.selected.length <= 0) return state;
      return {
        ...state,
        view: action.payload
      }

    case "UPDATE_CALORIE_RESULT":
      return {
        ...state,
        dishesData: action.payload,
        view: 2
      }

    default:
      state;
  }
}

export function changeSearchQuery(value) {
  return {
    type: "UPDATE_SEARCH_QUERY",
    payload: value
  }
}

export function toggleRecipe(recipeId) {
  return {
    type: "UPDATE_SELECTED_RECIPES",
    payload: recipeId
  }
}

export function setView(view) {
  return {
    type: "UPDATE_VIEW",
    payload: view
  }
}

export function setCalorieResult(dishesData) {
  return {
    type: "UPDATE_CALORIE_RESULT",
    payload: dishesData
  }
}