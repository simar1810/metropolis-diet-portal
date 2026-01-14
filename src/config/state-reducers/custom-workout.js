import { format, parse } from "date-fns";
import { customWorkoutInitialState } from "../state-data/custom-workout";
import { DAYS } from "../data/ui";

export function customWorkoutReducer(state, action) {
  switch (action.type) {
    case "SELECT_WORKOUT_TYPE":
      if (action.payload === "daily") return {
        ...state,
        stage: 2,
        mode: "daily",
        creationType: "new",
        selectedPlan: "daily",
        selectedPlans: {
          daily: {
            workouts: []
          }
        },
      }
      else if (action.payload === "weekly") return {
        ...state,
        stage: 2,
        mode: "weekly",
        creationType: "new",
        selectedPlan: "sun",
        selectedPlans: DAYS.reduce((acc, curr) => {
          acc[curr] = {
            workouts: []
          };
          return acc;
        }, {})
      }
      else return {
        ...state,
        stage: 2,
        mode: "monthly",
        creationType: "new",
        selectedPlan: format(new Date(), 'dd-MM-yyyy'),
        selectedPlans: {
          [format(new Date(), 'dd-MM-yyyy')]: {
            workouts: []
          }
        }
      }
    case "INITIAL_STATE_DIFFERENT_CREATION":
      return {
        ...state,
        stage: 2,
        mode: action.payload.mode,
        creationType: action.payload.creationType,
        selectedPlan: action.payload.selectedPlan,
        selectedPlans: action.payload.plans,
        ...action.payload
      }
    case "CUSTOM_WORKOUT_UPDATE_FIELD":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "CHANGE_WORKOUT_PLAN":
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
    case "REMOVE_WORKOUT_TO_PLAN":
      delete state.plans[action.payload]
      delete state.selectedPlans[action.payload]
      return {
        ...state
      };
    case "SAVE_WORKOUT":
      if (action.payload.index || action.payload.index === 0) return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: {
            ...state.selectedPlans[state.selectedPlan],
            workouts: state.selectedPlans[state.selectedPlan].workouts
              .map((workout, index) => index === action.payload.index
                ? action.payload.workout
                : workout)
          }
        }
      }
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: {
            ...state.selectedPlans[state.selectedPlan],
            workouts: [
              ...state.selectedPlans[state.selectedPlan].workouts,
              action.payload.workout
            ]
          }
        }
      }
    case "DELETE_WORKOUT":
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [state.selectedPlan]: {
            ...state.selectedPlans[state.selectedPlan],
            workouts: state.selectedPlans[state.selectedPlan].workouts
              .filter((_, index) => index !== action.payload)
          }
        }
      }
    case "ADD_NEW_PLAN_TYPE":
      const formatted = format(parse(action.payload, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [formatted]: {
            workouts: []
          }
        },
        selectedPlan: formatted,
        selectedMealType: "Breakfast"
      }
    case "UPDATE_WORKOUT_PLAN_META_DATA":
      return {
        ...state,
        selectedPlans: {
          ...state.selectedPlans,
          [action.payload.plan]: {
            ...state.selectedPlans[action.payload.plan],
            ...action.payload.data
          }
        }
      }
    default:
      return state;
  }
}

export function selectWorkoutType(payload) {
  return {
    type: "SELECT_WORKOUT_TYPE",
    payload
  }
}

export function customWorkoutUpdateField(name, value) {
  return {
    type: "CUSTOM_WORKOUT_UPDATE_FIELD",
    payload: {
      name,
      value
    }
  }
}

export function changeWorkoutPlans(day, plan) {
  return {
    type: "CHANGE_WORKOUT_PLAN",
    payload: {
      day,
      plan
    }
  }
}

export function removeWorkoutFromPlans(payload) {
  return {
    type: "REMOVE_WORKOUT_TO_PLAN",
    payload
  }
}

export function saveWorkout(workout, index) {
  return {
    type: "SAVE_WORKOUT",
    payload: {
      workout,
      index
    }
  }
}

export function deleteWorkout(payload) {
  return {
    type: "DELETE_WORKOUT",
    payload
  }
}

export function customWorkoutIS(type, state) {
  if (type === "new") {
    return customWorkoutInitialState;
  } else {
    return {
      ...customWorkoutInitialState
    }
  }
}

export function changeStateDifferentCreation(payload) {
  return {
    type: "INITIAL_STATE_DIFFERENT_CREATION",
    payload
  }
}

export function workoutPlanCreationRP(state) {
  return {
    title: state.title || "",
    instructions: state.instructions || "",
    workouts: state.workouts,
    thumbnail: state.image || ""
  }
}

export function updateWorkoutPlanMetaData(plan, data) {
  return {
    type: "UPDATE_WORKOUT_PLAN_META_DATA",
    payload: {
      plan,
      data
    }
  }
}

export function addNewPlanType(payload) {
  return {
    type: "ADD_NEW_PLAN_TYPE",
    payload
  }
}

export function dailyWorkoutRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: state.plans
  }
}

export function weeklyWorkoutRP(state) {
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: state.plans
  }
}

export function monthlyWorkoutRP(state) {
  const payload = {}
  for (const day in state.plans) {
    const ddMMyyyy = format(parse(day, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
    payload[ddMMyyyy] = state.selectedPlans[day]._id
  }
  return {
    title: state.title,
    description: state.description,
    mode: state.mode,
    plans: payload
  }
}