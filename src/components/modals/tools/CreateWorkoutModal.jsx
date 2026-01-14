import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { workoutInitialState } from "@/config/state-data/workout";
import { addWorkout, changeFieldValue, generateRequestPayload, init, removeWorkout, workoutReducer } from "@/config/state-reducers/workout";
import { sendData, uploadImage } from "@/lib/api";
import { getAllWorkoutItems } from "@/lib/fetchers/app";
import { nameInitials } from "@/lib/formatter";
import { getObjectUrl } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { CloudCog, ImagePlus, Plus, PlusCircle, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import imageCompression from "browser-image-compression";

export default function CreateWorkoutModal({
  defaultOpen = true,
  children,
  data,
  setModal,
}) {
  return <Dialog defaultOpen={defaultOpen} onOpenChange={() => setModal()}>
    <DialogTrigger />
    {/* {!children && <DialogTrigger className="bg-[var(--accent-1)] text-white text-[14px] font-bold pl-4 pr-4 py-1 flex items-center gap-1 rounded-[8px]">
      <Plus className="w-[16px]" />
      Add
    </DialogTrigger>} */}
    {children}
    <DialogContent className="max-h-[70vh] p-0 overflow-y-auto no-scrollbar">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>Workout Details</DialogTitle>
      </DialogHeader>
      <CurrentStateProvider
        state={init(data)}
        reducer={workoutReducer}
      >
        <AddWorkoutContainer />
      </CurrentStateProvider>
    </DialogContent>
  </Dialog>
}

async function getLink(state) {
  if (state.type === "update") {
    const thumbnail = state.thumbnail instanceof File
      ? await uploadImage(state.thumbnail)
      : state.thumbnail;
    const data = generateRequestPayload(state, thumbnail.img);
    return await sendData("app/workout/update", data, "PUT");
  } else {
    const thumbnail = await uploadImage(state.thumbnail);
    if (thumbnail.status_code !== 200) throw new Error("Please try again later!")
    const data = generateRequestPayload(state, thumbnail.img);
    return await sendData("app/workout/create", data);
  }
}

function AddWorkoutContainer() {
  const [loading, setLoading] = useState(false);

  const { dispatch, ...state } = useCurrentStateContext();

  const closeBtnRef = useRef();
  const fileRef = useRef();

  async function saveWorkout() {
    try {
      setLoading(true);
      if (state.thumbnail instanceof File) state.thumbnail = await imageCompression(state.thumbnail, { maxSizeMB: 0.25 });
      const response = await getLink(state)
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message || "Note added successfully!");
      closeBtnRef.current.click();
      if (state.type === "update") {
        mutate(`app/getWorkoutDetails/${state.id}`)
      } else {
        mutate("app/coach/workoutCollections");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <div className="p-4 pt-0">
    <FormControl
      value={state.title}
      onChange={e => dispatch(changeFieldValue("title", e.target.value))}
      placeholder="Enter Title"
      label="Title"
    />

    <div className="mt-4">
      <p className="font-bold mb-2">Thumbnail</p>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 relative">
        <X
          onClick={() => dispatch(changeFieldValue("thumbnail", ""))}
          className={`absolute right-2 top-2 text-gray-400 cursor-pointer ${state.thumbnail ? "block" : "hidden"}`}
        />
        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*"
          onChange={(e) => dispatch(changeFieldValue("thumbnail", e.target.files[0]))}
        />
        {state.thumbnail
          ? <Image
            src={getObjectUrl(state.thumbnail) || "/not-found.png"}
            alt=""
            height={200}
            width={200}
            className="w-full max-h-[140px] object-contain"
            onClick={() => fileRef.current.click()}
          />
          : <div onClick={() => fileRef.current.click()} className="h-[140px] text-[var(--accent-1)] flex flex-col items-center justify-center">
            <ImagePlus size={24} className="mb-2" />
            <span>Add Image</span>
          </div>}
      </div>
    </div>

    <SelectWorkouts />

    <div className="mt-4">
      <p className="font-bold mb-2">Instructions</p>
      <Textarea
        value={state.instructions}
        onChange={e => dispatch(changeFieldValue("instructions", e.target.value))}
        placeholder="Enter instructions here (Optional)"
        className="resize-none h-[140px]"
      />
    </div>
    <Button disabled={loading} className="mt-5" variant="wz" onClick={saveWorkout}>Save</Button>
    <DialogClose ref={closeBtnRef} />
  </div>
}

function SelectWorkouts() {
  const [query, setQuery] = useState("");
  const { dispatch, workouts, selectedWorkouts } = useCurrentStateContext();

  const { isLoading, error, data } = useSWR("app/coach/getAllWorkoutItems", getAllWorkoutItems);

  const closeBtnRef = useRef();

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const workoutItems = data.data
    .filter(workout => workout.title.toLowerCase().includes(query.toLowerCase()))
    .filter(workout => Boolean(workout.video_link));

  const set = new Set(workouts)

  return <Dialog>
    <DialogTrigger className="w-full text-left p-0">
      <div className="mt-4">
        <div className="flex justify-between items-center gap-2">
          <p className="font-bold mb-2">Select Workouts</p>
          {set.size > 0 && <PlusCircle size={20} className="text-[var(--accent-1)] mb-2 mr-auto" />}
          <p>{workouts.length} selected!</p>
        </div>
        {set.size === 0 && <div className="h-[140px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-4 relative">
          <PlusCircle size={24} className="text-[var(--accent-1)] mb-2" />
          <p className="text-[var(--accent-1)]">Add Workout</p>
        </div>}
        {selectedWorkouts.map((workout, index) => <div key={index} className="mt-3 flex items-center gap-2">
          <Avatar className="w-[40px] h-[40px] border-1">
            <AvatarImage src={workout.thumbnail} />
            <AvatarFallback>{nameInitials(workout.title || "")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[14px] mb-1">{workout.title}</p>
            <p className="text-[10px]">{workout.duration}</p>
          </div>
        </div>)}
      </div>
    </DialogTrigger>
    <DialogContent className="h-[70vh] p-0 overflow-y-auto block">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>Select Workouts</DialogTitle>
      </DialogHeader>
      <div className="m-4">
        <FormControl
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search"
        />
      </div>
      <div className="px-4 py-0">
        <p className="mb-2">{workoutItems.length} items found!</p>
        {workoutItems.map(item => <div key={item._id} className="flex items-start gap-2 mb-4">
          <input
            checked={set.has(item._id)}
            type="checkbox"
            className="h-[20px] w-[20px] mt-2"
            id={item._id}
            onChange={() => set.has(item._id)
              ? dispatch(removeWorkout(item))
              : dispatch(addWorkout(item))}
          />
          <label htmlFor={item._id} className="text-sm grow">
            <Image
              src={item?.thumbnail?.trim() || "/not-found.png"}
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
      <div className="bg-white p-4 sticky bottom-0">
        <Button onClick={() => closeBtnRef.current.click()} className="w-full">Done</Button>
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}