import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addNewPlanType } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useRef, useState } from "react";

export default function AddDayModal() {
  const [value, setValue] = useState("");
  const { dispatch } = useCurrentStateContext()
  const closeRef = useRef()
  return <Dialog>
    <DialogTrigger asChild>
      <Button variant="wz">Add</Button>
    </DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1">Add New Date</DialogTitle>
      <div className="p-4">
        <FormControl
          type="date"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Please Enter the date"
        />
        <Button
          variant="wz"
          className="mt-4 w-full"
          onClick={() => {
            dispatch(addNewPlanType(value))
            closeRef.current.click()
          }}
        >
          Save
        </Button>
        <DialogClose ref={closeRef} />
      </div>
    </DialogContent>
  </Dialog>
}