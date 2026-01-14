import { newMarathonInitialState } from "../state-data/new-marathon"

export function newMarathonReducer(state, action) {
  switch (action.type) {
    case "SELECT_TASK":
      return {
        ...state,
        selected: state.selected.includes(action.payload)
          ? state.selected.filter(task => task !== action.payload)
          : [...state.selected, action.payload]
      }
    case "CHANGE_FIELD":
      return {
        ...state,
        [action.payload.name]: action.payload.value
      }
    case "ADD_TASK":
      return {
        ...state,
        selected: [...state.selected, action.payload._id],
        tasks: [...state.tasks, ({ ...action.payload, photoSubmission: false, videoSubmission: false })]
      }
    case "DELETE_TASK":
      return {
        ...state,
        selected: state.selected.filter(task => task !== action.payload),
        tasks: state.tasks.filter(task => task._id !== action.payload)
      }
    case "CHANGE_SUBMISSION_REQUIREMENTS":
      return {
        ...state,
        tasks: state.tasks.map(prev => prev._id !== action.payload.taskId
          ? prev
          : ({
            ...prev,
            [action.payload.name]: action.payload.value
          })),
      }
    default:
      return state;
  }
}

export function changeField(name, value) {
  return {
    type: "CHANGE_FIELD",
    payload: { name, value }
  }
}

export function selectTask(payload) {
  return {
    type: "SELECT_TASK",
    payload
  }
}

export function addTask(payload) {
  return {
    type: "ADD_TASK",
    payload
  }
}

export function deleteTask(payload) {
  return {
    type: "DELETE_TASK",
    payload
  }
}

export function changeSubmissionReuirements(taskId, name, value) {
  return {
    type: "CHANGE_SUBMISSION_REQUIREMENTS",
    payload: { taskId, name, value }
  }
}

export function generatePayload(data) {
  const payload = {
    title: data.title,
    tasks: data.tasks
  }
  if (data.type === "update") {
    payload.marathonId = data.id;
  }
  return payload
}

export function init(type, data) {
  if (type === "update") {
    const payload = {
      title: data.title,
      selected: data.tasks.map(task => task._id),
      tasks: data.tasks,
      type: "update",
      id: data._id
    }
    return payload
  } else {
    return newMarathonInitialState;
  }
}