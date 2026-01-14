import { ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import { Textarea } from "../ui/textarea";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { changeFieldvalue, setCurrentStage, stage1Completed } from "@/config/state-reducers/add-meal-plan";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { sendDataWithFormData } from "@/lib/api";
import { getObjectUrl } from "@/lib/utils";
import imageCompression from "browser-image-compression";

export default function AddMealPlanModal() {
  const [thumbnail, setThumbnail] = useState();
  const { dispatch, ...state } = useCurrentStateContext();

  async function changeStage() {
    if (thumbnail) {
      const image = await uploadMealPlanThumbnail()
      const completed = stage1Completed({ ...state, image });
      if (!completed.success) toast.error(`Field ${completed.field} is required!`)
    }
    dispatch(setCurrentStage(2))
  }

  async function uploadMealPlanThumbnail() {
    try {
      const data = new FormData();
      if (thumbnail) {
        const image = await imageCompression(thumbnail, { maxSizeMB: 0.25 })
        data.append("file", image)
        const response = await sendDataWithFormData("app/getPlanImageWeb", data);
        if (response.status_code !== 200) throw new Error(response.message)
        dispatch(changeFieldvalue("image", response.img))
        return response.img
      } else if (state.image) {
        return state.image
      } else throw new Error("Please select an image")
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    }
  }

  const fileRef = useRef();
  return (
    <Dialog defaultOpen={true}>
      <DialogTrigger />
      <DialogContent className="!max-w-[450px] h-[70vh] border-0 p-0 overflow-y-auto">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            Add Plan
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pt-4 pb-6 space-y-6">
          <div>
            <p className="font-medium mb-2">Name</p>
            <FormControl
              value={state.name}
              onChange={e => dispatch(changeFieldvalue("name", e.target.value))}
              placeholder="Enter Title"
              className="w-full"
            />
          </div>
          <div>
            <p className="font-medium mb-2">Thumbnail</p>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <input
                type="file"
                hidden ref={fileRef}
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
              {thumbnail || state.image
                ? <Image
                  src={state.image && !thumbnail ? state.image : getObjectUrl(thumbnail)}
                  alt=""
                  height={200}
                  width={200}
                  className="w-full max-h-[180px] object-contain"
                  onClick={() => fileRef.current.click()}
                />
                : <div onClick={() => fileRef.current.click()} className="flex flex-col items-center justify-center text-gray-400">
                  <ImagePlus size={24} className="mb-2" />
                  <span>Add Image</span>
                </div>}
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Description</p>
            <Textarea
              value={state.description}
              onChange={e => dispatch(changeFieldvalue("description", e.target.value))}
              placeholder="Enter description here"
              className="w-full min-h-[120px]"
            />
          </div>
          <div className="pt-4">
            <Button
              variant="wz"
              className="block mx-auto"
              onClick={changeStage}
            >
              Start Adding Meal Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
