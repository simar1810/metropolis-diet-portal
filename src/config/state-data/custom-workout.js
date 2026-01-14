export const customWorkoutInitialState = {
  stage: 1,
  mode: "daily", // e.g. daily, weekly, monthly, 
  title: "",
  file: "",
  thumbnail: "",
  description: "",
  selectedDate: "",
  plans: {},
  selectedPlans: {
    daily: {
      workouts: []
    }
  },
  selectedPlan: "daily"
}