import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { copyAllMealPlans } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useMemo, useRef } from "react";

export default function CopyMealPlanModal({ to, trigger, open, onOpenChange }) {
  const { selectedPlans, dispatch } = useCurrentStateContext()
  const dialogcloseBtn = useRef()
  const plans = useMemo(
    () => Object.keys(selectedPlans).filter(plan => plan !== to),
    [selectedPlans, to],
  )

  const triggerNode = trigger ?? (
    <Button size="sm" variant="wz_outline">Copy Meals</Button>
  )

  const closeDialog = () => {
    if (dialogcloseBtn.current) {
      dialogcloseBtn.current.click();
      return;
    }
    if (typeof onOpenChange === "function") {
      onOpenChange(false);
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    {triggerNode && (
      <DialogTrigger asChild>
        {triggerNode}
      </DialogTrigger>
    )}
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1">Copy Meals</DialogTitle>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {plans.map((plan, index) => <Button
            key={index}
            onClick={() => {
              dispatch(copyAllMealPlans(plan, to))
              closeDialog();
            }}
          >
            {plan}
          </Button>)}
        </div>
      </div>
      <DialogClose ref={dialogcloseBtn} />
    </DialogContent>
  </Dialog>
}