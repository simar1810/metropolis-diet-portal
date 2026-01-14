import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { changeFieldvalue, changeMealTypeValue, deleteMealTypeValue } from "@/config/state-reducers/add-meal-plan";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

export default function EditMealTypeModal({ mealType, index }) {
  const [value, setValue] = useState(() => mealType)
  const closeBtnRef = useRef();
  const { dispatch, meals } = useCurrentStateContext();

  return <Dialog>
    <DialogTrigger className="font-bold px-2 py-1 rounded-[8px]">
      <Pencil className="w-[12px] h-[12px]" />
    </DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>Edit Meal Type</DialogTitle>
      </DialogHeader>
      <div className="p-4">
        <FormControl
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Button
          onClick={() => {
            dispatch(changeMealTypeValue(index, value));
            closeBtnRef.current.click();
          }}
          variant="wz"
          className="mr-2 mt-4"
        >
          Continue
        </Button>
        {meals.length > 1 && <Button
          onClick={() => {
            dispatch(deleteMealTypeValue(index));
            closeBtnRef.current.click();
          }}
          className="bg-[var(--accent-2)] font-bold"
        >
          Delete
        </Button>}
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}