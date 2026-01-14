import { Button } from "@/components/ui/button";
import { deleteWorkout, saveWorkout, updateWorkoutPlanMetaData } from "@/config/state-reducers/custom-workout";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Minus, PlusCircle } from "lucide-react";
import FormControl from "@/components/FormControl";
import EditSelectedWorkoutDetails from "./EditSelectedWorkoutDetails";

export default function SelecWorkouts() {
  const {
    dispatch,
    selectedPlan,
    selectedPlans,
    ...state
  } = useCurrentStateContext();

  const selectedPlanData = selectedPlans[selectedPlan]
  const workouts = selectedPlanData.workouts || []
  return <div className="pt-4">
    <SelectedWorkoutPlanData
      selectedPlan={selectedPlan}
      plan={selectedPlanData}
    />
    <div className="pt-4 flex gap-4 overflow-x-auto no-scrollbar">
      <h3>Select Workouts</h3>
    </div>
    {workouts.map((workout, index) => <div key={index + 1} className="flex items-center justify-between">
      <EditSelectedWorkoutDetails
        key={workout._id}
        workout={workout}
        index={index}
      />
      <Minus
        className="cursor-pointer bg-[var(--accent-2)] text-white rounded-full p-[2px]"
        strokeWidth={3}
        onClick={() => dispatch(deleteWorkout(index))}
      />
    </div>)}
    <div>
    </div>
    <Button
      onClick={() => dispatch(saveWorkout({}))}
      className="bg-transparent hover:bg-transparent w-full h-[120px] border-1 mt-4 flex items-center justify-center rounded-[8px]"
    >
      <PlusCircle className="min-w-[32px] min-h-[32px] text-[var(--accent-1)]" />
    </Button>
  </div>
}

function SelectedWorkoutPlanData({ selectedPlan, plan }) {
  const { dispatch } = useCurrentStateContext()
  return <>
    <FormControl
      label="Title"
      value={plan.title || ""}
      onChange={e => dispatch(updateWorkoutPlanMetaData(selectedPlan, { title: e.target.value }))}
      className="mb-4 block"
    />
    <FormControl
      label="Instructions"
      value={plan.instructions || ""}
      onChange={e => dispatch(updateWorkoutPlanMetaData(selectedPlan, { instructions: e.target.value }))}
      className="mb-4 block"
    />
  </>
}