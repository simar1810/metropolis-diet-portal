import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { format, parse } from "date-fns";
import { Pencil, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function UpdateMealPlanRecipeModal({ mealType, mealPlan, recipe }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: recipe.name,
    description: recipe.description,
    file: undefined,
    meal_time: recipe.meal_time ? format(parse(recipe.meal_time, "HH:mm", new Date()), "HH:mm") : ""
  }));
  const closeBtnRef = useRef();
  const fileRef = useRef();

  async function updateMealPlan() {
    try {
      setLoading(true);
      if (formData.file) {
        const data = new FormData();
        data.append("file", formData.file);
        const response = await sendDataWithFormData("app/getPlanImageWeb", data);
        formData.image = response.img;
      }
      if (!formData.meal_time) throw new Error("Meal Time is required")
      const payload = mealPlan.meals.map(meals => meals.mealType === mealType
        ? {
          ...meals,
          meals: meals.meals.map(meal => meal.meal_id === recipe.meal_id
            ? {
              ...meal,
              ...formData,
              meal_time: format(parse(formData.meal_time, "HH:mm", new Date()), "hh:mm")
            }
            : meal)
        }
        : meals
      )
      const response = await sendData(`app/update-plan?id=${mealPlan._id}`, { meals: payload }, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message || "Successfully updated the meal plan!");
      closeBtnRef.current.click();
      mutate(`app/meal-plan/${mealPlan._id}`);
    } catch (error) {
      toast.error(error.message || "Please try again later");
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger>
      <Pencil className="w-[16px] h-[16px] text-[var(--accent-1)] absolute bottom-4 right-4" />
    </DialogTrigger>
    <DialogContent className="max-h-[70vh] p-0 gap-0 overflow-y-auto">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>Edit Meal</DialogTitle>
      </DialogHeader>
      <div className="p-4">
        <div className="relative">
          <input
            type="file"
            onChange={e => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
            ref={fileRef}
            hidden
          />
          <Image
            src={formData.file ? URL.createObjectURL(formData.file) : recipe.image || "/not-found.png"}
            height={540}
            width={540}
            alt="meal-plan"
            className="w-full h-[200px] object-contain rounded-[8px]"
            onClick={() => fileRef.current.click()}
          />
          {formData.file && <X
            className="w-[16px] h-[16px] absolute top-4 right-4 cursor-pointer"
            onClick={() => setFormData(prev => ({ ...prev, file: undefined }))}
          />}
        </div>
        <div className="flex flex-col gap-4">
          <label className="text-[14px] font-semibold">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="border-1 border-[var(--dark-1)]/25 rounded-[8px] px-4 py-2"
          />
        </div>
        <div className="flex flex-col gap-4">
          <label className="text-[14px] font-semibold">Meal Time</label>
          <input
            type="time"
            value={formData.meal_time}
            onChange={e => setFormData({ ...formData, meal_time: e.target.value })}
            className="border-1 border-[var(--dark-1)]/25 rounded-[8px] px-4 py-2"
          />
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <label className="text-[14px] font-semibold">Description</label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="h-[140px]"
          />
        </div>
        <Button
          disabled={loading}
          onClick={updateMealPlan}
          variant="wz"
          className="mr-2 mt-4"
        >
          Continue
        </Button>
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}