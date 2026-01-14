import FormControl from "@/components/FormControl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customWorkoutUpdateField } from "@/config/state-reducers/custom-workout";
import { getObjectUrl } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import Image from "next/image";
import { useRef } from "react";

export default function WorkoutMetaData() {
  const { dispatch, title, description, ...state } = useCurrentStateContext()
  const fileRef = useRef();
  return <div className="flex flex-col gap-y-4 md:pr-8">
    <FormControl
      value={title}
      onChange={e => dispatch(customWorkoutUpdateField("title", e.target.value))}
      placeholder="Enter title"
      label="Title"
    />
    <div>
      <Label className="font-bold mb-2">Thumbnail</Label>
      <Image
        src={state.file ? getObjectUrl(state.file) : "/not-found.png"}
        alt=""
        height={400}
        width={400}
        className="max-h-[220px] w-full object-cover rounded-[10px]"
        onClick={() => fileRef.current.click()}
      />
      <input
        type="file"
        onChange={(e) => dispatch(customWorkoutUpdateField("file", e.target.files[0]))}
        ref={fileRef}
        hidden
      />
    </div>
    <div className="mt-4">
      <Label className="font-bold mb-2">Description</Label>
      <Textarea
        value={description}
        onChange={e => dispatch(customWorkoutUpdateField("description", e.target.value))}
        placeholder="Enter Description"
        label="Description"
        className="min-h-[120px]"
      />
    </div>
  </div>
}