import useCurrentStateContext from "@/providers/CurrentStateContext"
import PersonalDetails from "./PersonalDetails"
import GoalStage from "./GoalStage"
import GenderDobForm from "./GenderDOB"
import ExerciseActivity from "./ExerciseActivity"
import ConditionsAllergies from "./ConditionsAllergies"
import Preferences from "./Preferences"

export default function RegisterUserContainer() {
  return <div className="mt-10 max-w-[500px] mx-auto">
    <NestedComponent />
  </div>
}

function NestedComponent() {
  const { stage } = useCurrentStateContext()
  if (stage === "mobilenumber") return <PersonalDetails />
  if (stage === "goal") return <GoalStage />
  if (stage === "gender-dob") return <GenderDobForm />
  if (stage === "exercise-activity") return <ExerciseActivity />
  if (stage === "conditions-allergies") return <ConditionsAllergies />
  if (stage === "preferences") return <Preferences />
}