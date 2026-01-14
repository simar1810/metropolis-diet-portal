import FormControl from "@/components/FormControl";
import UploadImage from "@/components/modals/UploadImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveRecipe } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { DialogTitle } from "@radix-ui/react-dialog";
import { format, parse } from "date-fns";
import { Plus, Search, } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SelectMealCollection from "./SelectMealCollection";

const MEASURE_OPTIONS = [
  { value: "cup", label: "Cup" },
  { value: "tablespoon", label: "Tablespoon (tbsp)" },
  { value: "teaspoon", label: "Teaspoon (tsp)" },
  { value: "bowl", label: "Bowl (small/medium/large)" },
  { value: "katori", label: "Katori (standard Indian bowl, ~150 ml)" },
  { value: "glass", label: "Glass (small/medium/large)" },
  { value: "plate", label: "Plate (small/full/half)" },
  { value: "piece", label: "Piece" },
  { value: "slice", label: "Slice" },
  { value: "poha_serving", label: "Poha serving (1 medium bowl)" },
  { value: "rice_serving", label: "Rice serving (1 medium bowl)" },
  { value: "sabzi", label: "Sabzi (1 katori or ½ cup)" },
  { value: "dal", label: "Dal (1 katori)" },
  { value: "spoonful", label: "Spoonful (1 serving spoon, ~10 g)" },
  { value: "handful", label: "Handful" },
  { value: "pinch", label: "Pinch (spices, salt)" },
  { value: "scoop", label: "Scoop" },
  { value: "packet", label: "Packet" },
  { value: "bottle", label: "Bottle" },
  { value: "cup_240ml", label: "Cup (standard 240 ml)" },
  { value: "gram", label: "Gram (g)" },
  { value: "kilogram", label: "Kilogram (kg)" },
  { value: "millilitre", label: "Millilitre (ml)" },
  { value: "litre", label: "Litre (L)" },
  { value: "small_medium_large", label: "Small / Medium / Large piece" },
  { value: "serving", label: "Serving (customized portion)" },
];

export default function EditSelectedMealDetails({
  defaultOpen,
  children,
  recipe,
  index,
  path,
  optionType
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const { dispatch } = useCurrentStateContext();
  const [formData, setFormData] = useState(recipe);
  const onChangeHandler = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const closeBtnRef = useRef()
  const defaultSearchQuery = formData.dish_name || recipe?.dish_name || recipe?.name || recipe?.title || "rajma";

  useEffect(() => {
    setFormData(recipe);
  }, [recipe]);

  function updateDish(open) {
    if (open === true) return;
    for (const field of ["dish_name", "time"]) {
      if (!formData[field]) {
        toast.error(`${field} is required.`)
        return
      }
    }
    // Pass path (if available) or index
    const identifier = path ? { path } : index;
    dispatch(saveRecipe(formData, identifier, undefined, optionType))
    setOpen(false)
  }

  function onOpenChange(val) {
    setOpen(val)
  }

  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!children && <DialogTrigger className="w-full">
        <div className="mt-4 flex items-start gap-4">
          <div className="relative max-h-[100px] w-[200px]">
            <Image
              alt=""
              src={recipe.image || "/not-found.png"}
              height={100}
              width={100}
              onError={e => e.target.src = "/not-found.png"}
              className="rounded-lg bg-[var(--comp-1)] object-contain border-1"
            />
            <div
              onClick={e => {
                e.stopPropagation();
                setSearchModalOpen(true);
              }}
              className="cursor-pointer absolute bottom-0 left-0 translate-y-[50%] translate-x-[-50%]">
              <Plus
                className="bg-[var(--accent-1)] text-white rounded-full p-[2px]"
              />
            </div>
          </div>
          <div className="text-left text-sm md:text-base">
            <h3>{recipe.name || recipe.dish_name || recipe.title}</h3>
            {recipe.description && (
              <p className="leading-[1.2] text-[14px] text-black/60 mt-1 line-clamp-2">{recipe.description}</p>
            )}
            {recipe.time && <p className="mt-1">
              {format(
                parse(recipe.time, "HH:mm", new Date()),
                "hh:mm a"
              )}
            </p>}
            {!recipe.time && recipe.meal_time && <p className="mt-1">
              {recipe.meal_time}
            </p>}
            <div className="mt-2 flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
              {typeof recipe.calories === "object"
                ? <RecipeCalories recipe={recipe} />
                : <MealCalories recipe={recipe} />}
            </div>
          </div>
        </div>
      </DialogTrigger>}
      {children}
      <DialogContent className="p-0 gap-0 max-h-[70vh] overflow-y-auto">
        <DialogTitle className="p-4 border-b-1">Details</DialogTitle>
        <div className="p-4">
          <Image
            alt=""
            src={recipe.image || "/not-found.png"}
            height={100}
            width={100}
            className="w-full h-[250px] bg-[var(--comp-1)] rounded-lg object-contain border-1"
          />
          <div className="mt-2 mb-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => setSearchModalOpen(true)}>
              <Search />
              Search
            </Button>
            {recipe._id && <UploadImage setter={(image) => setFormData({ ...formData, image })} />}
          </div>
          <FormControl
            value={formData.dish_name || formData.name || ""}
            name="dish_name"
            onChange={onChangeHandler}
            placeholder="Dish Name"
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
            type="time"
            value={formData.time || ""}
            name="time"
            onChange={onChangeHandler}
            className="block mb-4"
          />
          <h3>Nutrition Values</h3>
          <label className="flex justify-between items-center">
            <span>Serving Size</span>
            <FormControl
              value={formData.serving_size || ""}
              name="serving_size"
              onChange={onChangeHandler}
            />
          </label>
          <label className="flex justify-between items-center">
            <span>Calories</span>
            <FormControl
              value={formData.calories || ""}
              name="calories"
              onChange={onChangeHandler}
            />
          </label>
          <label className="flex justify-between items-center">
            <span>Proteins</span>
            <FormControl
              value={formData.protein || ""}
              name="protein"
              onChange={onChangeHandler}
            />
          </label>
          <label className="flex justify-between items-center">
            <span>Carbohydrates</span>
            <FormControl
              value={formData.carbohydrates || ""}
              name="carbohydrates"
              onChange={onChangeHandler}
            />
          </label>
          <label className="flex justify-between items-center">
            <span>Fats</span>
            <FormControl
              value={formData.fats || ""}
              name="fats"
              onChange={onChangeHandler}
            />
          </label>
          <label className="mt-2 flex justify-between items-center">
            <span>Measure</span>
            <Select
              value={formData.measure || undefined}
              onValueChange={(value) => setFormData({ ...formData, measure: value })}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Select measure" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {MEASURE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Button
            className="w-full mt-4"
            variant="wz"
            onClick={updateDish}
          >
            Save
          </Button>
          <DialogClose ref={closeBtnRef} />
        </div>
      </DialogContent>
    </Dialog>
    <SelectMealCollection
      searchModalOpen={searchModalOpen}
      setSearchModalOpen={setSearchModalOpen}
      openChange={setSearchModalOpen}
      defaultSearch={typeof defaultSearchQuery === "string" ? defaultSearchQuery : "rajma"}
      index={index}
      path={path}
      optionType={optionType}
    >
      <></>
    </SelectMealCollection>
  </>
}

function MealCalories({ recipe }) {
  return <div className="flex flex-row flex-wrap gap-1">
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Serving Size -</span>{recipe?.serving_size}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Kcal -</span>{recipe?.calories}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Protien -</span> {recipe.protein}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Carbs -</span> {recipe.carbohydrates}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Fats -</span> {recipe.fats}</Badge>
    {recipe.measure !== undefined && <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Measure -</span> {recipe.measure}</Badge>}
  </div>
}

function RecipeCalories({ recipe }) {
  return <div className="flex flex-row flex-wrap gap-1">
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Protien -</span> {recipe?.calories?.proteins}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Carbs -</span> {recipe?.calories?.carbs}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Fats -</span> {recipe?.calories?.fats}</Badge>
    <Badge className="bg-[#EFEFEF] text-black"><span className="text-black/40">Kcal -</span>{recipe?.calories?.total}</Badge>
  </div>
}