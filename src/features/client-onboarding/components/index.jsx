import useCurrentStateContext from "@/providers/CurrentStateContext"
import PersonalDetails from "./PersonalDetails"
import GoalStage from "./GoalStage"
import GenderDobForm from "./GenderDOB"
import ExerciseActivity from "./ExerciseActivity"
import ConditionsAllergies from "./ConditionsAllergies"
import Preferences from "./Preferences"
import { Button } from "@/components/ui/button"
import { previousStep } from "../state/client-onboarding-reducer"
import { ArrowLeft } from "lucide-react"
import CountryRegionSelector from "./CountryRegionSelector"

export default function RegisterUserContainer() {
  const { dispatch, stage } = useCurrentStateContext()
  return <div className="bg-gray-100 mt-10 max-w-[500px] mx-auto border-1 rounded-[10px] overflow-clip">
    <div className="p-4 h-16 flex items-center gap-4 text-white bg-green-900">
      {!["mobilenumber"].includes(stage) && <Button
        variant="icon"
        onClick={() => dispatch(previousStep())}
        className="px-[2px] h-[32px] w-[32px] !rounded-full aspect-square bg-black"
      >
        <ArrowLeft className="!w-[24px] !h-[24px] text-white" />
      </Button>}
      <h4 className="grow text-center">Client Preferences</h4>
    </div>
    <div className="p-4">
      <NestedComponent />
    </div>
  </div>
}

function NestedComponent() {
  const { stage } = useCurrentStateContext()
  if (stage === "mobilenumber") return <PersonalDetails />
  if (stage === "goal") return <GoalStage />
  if (stage === "gender-dob") return <GenderDobForm />
  if (stage === "exercise-activity") return <ExerciseActivity />
  if (stage === "conditions-allergies") return <ConditionsAllergies />
  if (stage === "region-selection") return <CountryRegionSelector />
  if (stage === "preferences") return <Preferences />
}