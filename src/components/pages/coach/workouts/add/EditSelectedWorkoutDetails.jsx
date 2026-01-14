import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Pen, Image as ImageIcon, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FormControl from "@/components/FormControl";
import { useRef, useState } from "react";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import SelectCustomWorkout from "./SelectCustomWorkout";
import { saveWorkout } from "@/config/state-reducers/custom-workout";

export default function EditSelectedWorkoutDetails({
  children,
  workout,
  index
}) {
  const [formData, setFormData] = useState(workout);
  const { dispatch } = useCurrentStateContext();
  const onChangeHandler = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const closeBtnRef = useRef()
  return <Dialog>
    {!children && <DialogTrigger className="w-full">
      <div className="mt-4 flex items-start gap-4">
        <Image
          alt=""
          src={workout.thumbnail || "/not-found.png"}
          height={100}
          width={100}
          className="rounded-lg max-h-[100px] bg-[var(--comp-1)] object-contain border-1"
        />
        <div className="text-left grow">
          <h3>{workout.title}</h3>
          <p>{workout.duration}</p>
        </div>
      </div>
    </DialogTrigger>}
    {children}
    <DialogContent className="p-0 gap-0 max-h-[70vh] overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">Details</DialogTitle>
      <div className="p-4">
        <Image
          alt=""
          src={workout.thumbnail || "/not-found.png"}
          height={100}
          width={100}
          className="w-full h-[140px] rounded-lg object-contain"
        />
        <div className="mt-2 mb-6 flex justify-between items-center">
          <SelectCustomWorkout index={index}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search />
                Search
              </Button>
            </DialogTrigger>
          </SelectCustomWorkout>
          {/* <Button variant="outline">
            <ImageIcon />
            Upload Image
          </Button> */}
        </div>
        <FormControl
          value={formData.title || ""}
          name="title"
          onChange={onChangeHandler}
          placeholder="Workout Title"
          className="block mb-4"
        />
        <FormControl
          value={formData.video_link || ""}
          name="video_link"
          onChange={onChangeHandler}
          placeholder="Workout Link"
          className="block mb-4"
        />
        <FormControl
          value={formData.description || ""}
          name="description"
          onChange={onChangeHandler}
          placeholder="Description"
          className="block mb-4"
        />
        <FormControl
          value={formData.duration || ""}
          name="duration"
          onChange={onChangeHandler}
          placeholder="Duration"
          className="block mb-4"
        />
        <FormControl
          value={formData.calorie || ""}
          name="calorie"
          onChange={onChangeHandler}
          placeholder="Calorie"
          className="block mb-4"
        />
        <Button
          className="w-full mt-4"
          variant="wz"
          onClick={() => {
            dispatch(saveWorkout(formData, index))
            closeBtnRef.current.click()
          }}
        >
          Save
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}