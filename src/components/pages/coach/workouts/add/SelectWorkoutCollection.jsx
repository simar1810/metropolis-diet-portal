import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export default function SelectWorkoutCollection({
  workouts = [],
  selectedWorkouts = [],
  onChange,
  children
}) {

  const closeBtnRef = useRef(null);

  return <Dialog>
    {children}
    {!Boolean(children) && <DialogTrigger className="w-full mt-4">
      <h3 className="text-left">Select Workout</h3>
      <div className="w-full h-[120px] border-1 mt-4 flex items-center justify-center rounded-[8px]">
        <PlusCircle size={32} className="text-[var(--accent-1)]" />
      </div>
    </DialogTrigger>}
    <DialogContent className="max-w-[450px] max-h-[60vh] p-0 gap-0 overflow-y-auto">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>Select Workouts</DialogTitle>
      </DialogHeader>
      <div className="p-4">
        {workouts.map((workout) => <div key={workout._id} className="flex items-start gap-2 mb-6">
          <input
            checked={selectedWorkouts.includes(workout._id)}
            type="checkbox"
            className="h-[20px] w-[20px]"
            id={workout._id}
            onChange={() => onChange(workout)}
          />
          <label htmlFor={workout._id} className="text-sm grow">
            <h3 className="mb-2">{workout.title}</h3>
            <Image
              src={workout?.thumbnail?.trim() || "/not-found.png"}
              alt=""
              width={40}
              height={40}
              unoptimized
              onError={e => e.target.src = "/not-found.png"}
              className="w-full h-[140px] object-contain rounded-lg border-1"
            />
          </label>
        </div>)}
      </div>
      {selectedWorkouts.length > 0 && <div className="bg-white sticky px-4 py-2 bottom-0 border-t-1">
        <Button
          className="w-full"
          variant="wz"
          onClick={() => closeBtnRef.current.click()}
        >
          Done
        </Button>
      </div>}
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}