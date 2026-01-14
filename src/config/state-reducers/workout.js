import { workoutInitialState } from "../state-data/workout";

export function workoutReducer(state, action) {
  switch (action.type) {
    case "CHANGE_FIELD":
      return { ...state, [action.payload.name]: action.payload.value };
    case "REMOVE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.filter(workout => workout !== action.payload._id),
        selectedWorkouts: state.selectedWorkouts.filter(workout => workout._id !== action.payload._id)
      }
    case "ADD_WORKOUT":
      return {
        ...state,
        workouts: [...state.workouts, action.payload._id],
        selectedWorkouts: [...state.selectedWorkouts, action.payload]
      }
    default:
      return state;
  }
}

export function changeFieldValue(name, value) {
  return {
    type: "CHANGE_FIELD",
    payload: { name, value }
  }
}

export function addWorkout(payload) {
  return {
    type: "ADD_WORKOUT",
    payload
  }
}

export function removeWorkout(payload) {
  return {
    type: "REMOVE_WORKOUT",
    payload
  }
}

export function init(state) {
  if (Boolean(state)) {
    const data = {
      title: state.title,
      instructions: state.instructions,
      thumbnail: state.thumbnail,
      workouts: state.workouts.map(workout => workout._id),
      id: state._id,
      type: "update",
      selectedWorkouts: state.workouts
    }
    return data;
  }
  return workoutInitialState;
}

export function generateRequestPayload(state, thumbnail) {
  const formData = {}
  for (const field of ["title", "instructions", "workouts"]) {
    if (state[field]) {
      formData[field] = state[field];
    }
  }
  if (state.type === "update") {
    formData.id = state.id
  }
  formData.thumbnail = thumbnail;
  return formData;
}