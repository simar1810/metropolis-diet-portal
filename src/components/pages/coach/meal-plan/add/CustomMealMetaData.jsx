import FormControl from "@/components/FormControl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customWorkoutUpdateField } from "@/config/state-reducers/custom-meal";
import { getObjectUrl } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import Image from "next/image";
import { useRef } from "react";

export default function CustomMealMetaData() {
  const { dispatch, ...state } = useCurrentStateContext()
  const fileRef = useRef()
  return <div className="md:pr-8 flex flex-col gap-y-4">
    <FormControl
      value={state.title}
      onChange={e => dispatch(customWorkoutUpdateField("title", e.target.value))}
      placeholder="Enter title"
      label="Title"
    />
    <div>
      <Label className="font-bold mb-2">Thumbnail</Label>
      <Image
        src={state.file ? getObjectUrl(state.file) : state.thumbnail || "/not-found.png"}
        alt=""
        height={400}
        width={400}
        className="max-h-[220px] w-full object-cover rounded-[10px]"
        onClick={() => fileRef.current.click()}
        onError={e => e.target.src = "/not-found.png"}
      />
      <input
        type="file"
        onChange={(e) => dispatch(customWorkoutUpdateField("file", e.target.files[0]))}
        ref={fileRef}
        hidden
      />
    </div>
    <div>
      <Label className="font-bold mb-2">Description</Label>
      <Textarea
        value={state.description}
        onChange={e => dispatch(customWorkoutUpdateField("description", e.target.value))}
        placeholder="Enter Description"
        label="Description"
        className="min-h-[120px]"
      />
    </div>
    <div>
      <Label className="font-bold mb-2">Guidelines</Label>
      <Textarea
        value={state.guidelines}
        onChange={e => dispatch(customWorkoutUpdateField("guidelines", e.target.value))}
        placeholder="Enter Guidelines"
        label="Guidelines"
        className="min-h-[120px]"
      />
    </div>
    <div>
      <Label className="font-bold mb-2">Supplements</Label>
      <Textarea
        value={state.supplements}
        onChange={e => dispatch(customWorkoutUpdateField("supplements", e.target.value))}
        placeholder="Enter Supplements"
        label="Supplements"
        className="min-h-[120px]"
      />
    </div>
    {state.mode === "monthly" && <div>
      <Label className="font-bold mb-2">Number Of Days</Label>
      <FormControl
        value={state.noOfDays}
        onChange={e => (parseInt(e.target.value) >= 0 || e.target.value === "") &&
          dispatch(customWorkoutUpdateField("noOfDays", e.target.value))
        }
        placeholder="Enter Number of days"
        type="number"
        min={0}
        className="min-h-[120px]"
      />
    </div>}
  </div>
}