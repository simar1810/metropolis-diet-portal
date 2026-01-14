"use client"
import { ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { Textarea } from "../ui/textarea";
import { changeFieldvalue, generateRequestPayload, init, newRecipeeReducer } from "@/config/state-reducers/new-recipe";
import { Button } from "../ui/button";
import { sendDataWithFormData } from "@/lib/api";
import Image from "next/image";
import { getObjectUrl } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

const calorieFields = [
  { id: 1, label: "Calories", name: "total", unit: "Kcal" },
  { id: 2, label: "Protein", name: "proteins", unit: "gm" },
  { id: 3, label: "Carbs", name: "carbs", unit: "gm" },
  { id: 4, label: "Fat", name: "fats", unit: "gm" },
  { id: 5, label: "Fibres", name: "fibers", unit: "gm" },
]

export default function RecipeModal({ type, recipe }) {
  return (
    <Dialog>
      {type === "new"
        ? <DialogTrigger className="bg-[var(--accent-1)] text-[var(--primary-1)] text-xs md:text-[14px] font-[600] px-4 py-2 rounded-[8px]">
          Add New Recipe
        </DialogTrigger>
        : <DialogTrigger className="text-[12px] font-[ 400] px-2">
          Edit
        </DialogTrigger>}
      <DialogContent className="!max-w-[500px] max-h-[70vh] border-0 p-0 overflow-y-auto gap-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">New Recipe</DialogTitle>
        </DialogHeader>
        <CurrentStateProvider
          state={init(type, recipe)}
          reducer={newRecipeeReducer}
        >
          <NewRecipeContainer type={type} />
        </CurrentStateProvider>
      </DialogContent>
    </Dialog>
  );
}

async function getLink(type, payload, _id) {
  if (type === "new") {
    const response = await sendDataWithFormData("app/addRecipes", payload)
    return response;
  } else {
    const response = await sendDataWithFormData(`app/editRecipes?id=${_id}`, payload, "PUT")
    return response;
  }
}

function NewRecipeContainer({ type }) {
  const { dispatch, ...state } = useCurrentStateContext();
  const [loading, setLoading] = useState(false);

  const closeBtnRef = useRef();
  const fileRef = useRef();

  async function createNewRecipee() {
    try {
      setLoading(true);
      const payload = generateRequestPayload(state);
      const response = await getLink(type, payload, state._id)
      if (response.status_code !== 200) throw new Error(response.error || response.message);
      toast.success(response.message);
      mutate("getRecipes");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <DialogClose ref={closeBtnRef} />
    <div className="px-6 pt-4 pb-6 space-y-4">
      <div>
        <p className="font-medium">Recipe Name</p>
        <FormControl
          placeholder="Enter Recipe Name"
          className="w-full"
          value={state.title}
          onChange={e => dispatch(changeFieldvalue("title", e.target.value))}
        />
      </div>
      <div>
        <p className="font-medium mb-2">Ingredients</p>
        <Textarea
          placeholder="Enter Ingredients"
          className="w-full min-h-[120px]"
          value={state.ingredients}
          onChange={e => dispatch(changeFieldvalue("ingredients", e.target.value))}
        />
      </div>
      <div>
        <p className="font-medium">Thumbnail</p>
        <div className="border-2 border-dashed border-gray-200 rounded-lg">
          {state.file || state.image
            ? <Image
              src={getObjectUrl(state.file) || state.image}
              alt=""
              height={200}
              width={200}
              className="w-full h-[200px] object-contain"
              onClick={() => fileRef.current.click()}
            />
            : <div
              onClick={() => fileRef.current.click()}
              className="h-[120px] flex flex-col items-center justify-center text-gray-400"
            >
              <ImagePlus size={24} className="mb-2" />
              <span>Add Image</span>
            </div>}
          <input
            ref={fileRef}
            onChange={e => dispatch(changeFieldvalue("file", e.target.files[0]))}
            type="file"
            hidden
          />
        </div>
      </div>
      <div>
        <p className="font-medium mb-2">Method</p>
        <Textarea
          placeholder="Enter Method"
          className="w-full min-h-[120px]"
          value={state.method}
          onChange={e => dispatch(changeFieldvalue("method", e.target.value))}
        />
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        {calorieFields.map(field => <FormControl
          key={field.id}
          value={state[field.name]}
          onChange={e => dispatch(changeFieldvalue(field.name, e.target.value))}
          className="[&_.label]:font-[400] [&_.label]:text-[14px]  [&_.input]:text-[14px]"
          placeholder="required"
          type="number"
          {...field}
          label={`${field.label} - ${field.unit}`}
        />)}
      </div>
      <div className="pt-4">
        <Button disabled={loading} onClick={createNewRecipee} variant="wz">
          Save Recipe
        </Button>
      </div>
    </div>
  </>
}