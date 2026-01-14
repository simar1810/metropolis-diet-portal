export const customMealInitialState = {
  stage: 1,
  mode: "daily", // e.g. daily, weekly, monthly, 
  title: "",
  file: "",
  image: "",
  description: "",
  guidelines: "",
  supplements: "",
  selectedDate: "",
  selectedPlan: "daily",
  selectedMealType: "when_you_wake_up",
  selectedOption: "option_1",
  plans: {},
  noOfDays: 0,
  selectedPlans: {
    daily: [
      {
        mealType: "when_you_wake_up",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "before_breakfast",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "breakfast",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "mid_day_meal",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "lunch",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "post_lunch_snack",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "evening_snack",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "dinner",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "after_dinner",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
      {
        mealType: "before_sleep",
        meals: [{ optionType: "option_1", dishes: [] }],
        defaultMealTiming: ""
      },
    ]
  }, // { daily: [{ mealType: "Breakfast", meals: [] }
}