import { format, parse } from "date-fns";

export function addMealPlanReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD_VALUE":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "SET_CURRENT_STAGE":
      return {
        ...state,
        stage: action.payload
      }
    case "ADD_MEAL_TYPE":
      if (state.meals.find(mealType => mealType === action.payload)) return state;
      return {
        ...state,
        meals: [
          ...state.meals,
          {
            mealType: action.payload,
            meals: []
          },
        ],
        selectedMealType: action.payload
      }
    case "ADD_NEW_RECIPE":
      return {
        ...state,
        meals: state.meals.map(item => item.mealType === state.selectedMealType
          ? {
            ...item,
            meals: item.meals.map(meal => meal.id === action.payload.id
              ? ({
                id: action.payload.id,
                ...action.payload,
                file: "",
                meal_time: ""
              })
              : meal
            )
          }
          : item
        )
      }
    case "ADD_NEW_RECIPE_BLANK":
      return {
        ...state,
        meals: state.meals.map(item => item.mealType === state.selectedMealType
          ? {
            ...item, meals: [...item.meals, {
              id: action.payload,
              name: "",
              meal_time: "",
              file: "",
              description: ""
            }]
          }
          : item
        )
      }
    case "CHANGE_RECIPE_FIELD_VALUE":
      return {
        ...state,
        meals: state.meals.map(item => item.mealType === state.selectedMealType
          ? {
            ...item,
            meals: item.meals.map(meal => meal.id === action.payload.id
              ? ({ ...meal, [action.payload.name]: action.payload.value })
              : meal
            )
          }
          : item
        )
      }
    case "REMOVE_SELECTED_RECIPE":
      return {
        ...state,
        meals: state.meals.map(item => item.mealType === state.selectedMealType
          ? {
            ...item,
            meals: item.meals.filter(meal => meal.id !== action.payload)
          }
          : item
        )
      }
    case "CHANGE_MEAL_TYPE_VALUE":
      if (state.meals.find(meal => meal.mealType === action.payload.value)) return state;
      return {
        ...state,
        selectedMealType: action.payload.value,
        meals: state.meals.map((item, index) => index === action.payload.index
          ? {
            ...item,
            mealType: action.payload.value
          }
          : item
        )
      }
    case "DELETE_MEAL_TYPE":
      return {
        ...state,
        meals: state.meals.filter((meal, index) => index !== action.payload)
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

export function changeRecipeFieldValue(id, name, value) {
  return {
    type: "CHANGE_RECIPE_FIELD_VALUE",
    payload: {
      id, name, value
    }
  }
}

export function setCurrentStage(payload) {
  return {
    type: "SET_CURRENT_STAGE",
    payload
  }
}

export function addMealType(payload) {
  return {
    type: "ADD_MEAL_TYPE",
    payload
  }
}

export function addNewRecipe(payload) {
  return {
    type: "ADD_NEW_RECIPE",
    payload
  }
}

export function addNewRecipeBlank(payload) {
  return { type: "ADD_NEW_RECIPE_BLANK", payload }
}

export function removeSelectedRecipe(payload) {
  return {
    type: "REMOVE_SELECTED_RECIPE",
    payload
  }
}

export function changeMealTypeValue(index, value) {
  return {
    type: "CHANGE_MEAL_TYPE_VALUE",
    payload: {
      index,
      value
    }
  }
}

export function deleteMealTypeValue(payload) {
  return {
    type: "DELETE_MEAL_TYPE",
    payload
  }
}

export function init(data, creationType) {
  const payload = {
    stage: 1,
    name: `Copy of ${data.name}`,
    description: data.description,
    notes: data.notes,
    image: data.image,
    joiningDate: data.joiningDate,
    selectedMealType: data.meals?.at(0).mealType,
    creationType
  };
  for (const mealType of data.meals) {
    for (const meal of mealType.meals) {
      meal.id = (Math.random() * 1000000).toFixed(0)
      meal.meal_time = meal.meal_time.length === 5
        ? meal.meal_time
        : format(parse(meal.meal_time, "hh:mm a", new Date()), "HH:mm");
    }
  }
  payload.meals = data.meals;
  return payload;
}

const fields = {
  stage1: ["name", "description", "image"]
}

export function stage1Completed(state) {
  for (const field of fields.stage1) {
    if (!state[field]) return { success: false, field };
  }
  return { success: true }
}

const requestPayloadFields = ["name", "description"];
export function generateRequestPayload(state) {
  const payload = {};
  payload["joiningDate"] = null;
  payload["notes"] = null;
  for (const field of requestPayloadFields) {
    if (!state[field]) return { success: false, field };
    payload[field] = state[field];
  }
  for (const mealTypes of state.meals) {
    for (const meal of mealTypes.meals) {
      for (const mealField of ["name", "meal_time"]) {
        if (!meal[mealField]) return { success: false, field: mealField }
      }
    }
  }
  payload["meals"] = state.meals;
  return { success: true, data: payload };
}