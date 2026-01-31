import FormControl from "@/components/FormControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { saveRecipe } from "@/config/state-reducers/custom-meal";
import { uploadImage } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { DialogTitle } from "@radix-ui/react-dialog";
import { format, parse } from "date-fns";
import { Search } from "lucide-react";
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
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { dispatch } = useCurrentStateContext();
  const [formData, setFormData] = useState(recipe);
  const onChangeHandler = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const closeBtnRef = useRef();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    formData.image || recipe.image || "/not-found.png",
  );
  useEffect(() => {
    setFormData(recipe);
    setPreviewImage(recipe.image || "/not-found.png");
  }, [recipe]);

  useEffect(() => {
    if (!formData.selected_measure_name) {
      if (formData.default_measure?.name) {
        setFormData((prev) => ({
          ...prev,
          selected_measure_name: prev.default_measure.name,
        }));
        return;
      }

      if (formData.serving_size) {
        const parts = formData.serving_size.split(" ");
        if (parts.length > 1) {
          setFormData((prev) => ({
            ...prev,
            selected_measure_name: parts.slice(1).join(" "),
          }));
        }
      }
    }
  }, [
    formData.default_measure,
    formData.serving_size,
    formData.selected_measure_name,
  ]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    const MAX_SIZE_LIMIT = 1 * 1024 * 1024;
    if (!file) return;
    if (file && file.size > MAX_SIZE_LIMIT) {
      toast.error("File size more than 1MB");
      return;
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);
    try {
      setUploading(true);
      const response = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: response.img }));
      setPreviewImage(response.img || localPreview);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setUploading(false);
    }
  }

  function toNum(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function scaleFromPer100(per100, grams) {
    const factor = grams / 100;

    return {
      calories: (toNum(per100.calories) * factor).toFixed(1),
      protein: (toNum(per100.protein) * factor).toFixed(1),
      carbohydrates: (toNum(per100.carbohydrates) * factor).toFixed(1),
      fats: (toNum(per100.fats) * factor).toFixed(1),
      dietary_fibre:
        per100.dietary_fibre !== undefined
          ? (toNum(per100.dietary_fibre) * factor).toFixed(1)
          : "",
      sodium:
        per100.sodium !== undefined
          ? (toNum(per100.sodium) * factor).toFixed(1)
          : "",
    };
  }

  function updateDish(open) {
    if (open === true) return;
    for (const field of ["dish_name", "time"]) {
      if (!formData[field]) {
        toast.error(`${field} is required.`);
        return;
      }
    }
    dispatch(saveRecipe(formData, index));
    closeBtnRef.current.click();
    setOpen(false);
  }

  function onOpenChange() {
    dispatch(saveRecipe(formData, index, true));
    setOpen(!open);
  }
  const backendMeasures = Array.isArray(formData?.measures)
    ? formData.measures
    : [];

  function onMeasureChange(measureName, qty = formData.quantity || 1) {
    const m = backendMeasures.find((x) => x.name === measureName);
    if (!m) return;

    const totalGrams = m.grams * qty;
    const per100 = formData.per_100g;

    let next = {
      selected_measure_name: m.name,
      serving_size: `${qty} ${m.name} (${totalGrams}g)`,
    };

    if (per100) {
      next = {
        ...next,
        ...scaleFromPer100(per100, totalGrams),
      };
    }

    setFormData((prev) => ({ ...prev, ...next }));
  }

  function updateQuantity(rawQty) {
    const qty = Math.max(1, Number(rawQty) || 1);

    setFormData((prev) => {
      const measure = prev.selected_measure_name;

      if (measure && backendMeasures.some((m) => m.name === measure)) {
        setTimeout(() => onMeasureChange(measure, qty), 0);
        return { ...prev, quantity: qty };
      }

      return {
        ...prev,
        quantity: qty,
        serving_size: measure ? `${qty} ${measure}` : prev.serving_size,
      };
    });
  }

  function QuantityInput({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      function handleClickOutside(e) {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={ref} className="relative w-[70px]">
        <input
          type="number"
          min="1"
          step="1"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border rounded-md focus:outline-none"
        />

        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
            {[1, 2, 3, 4, 5].map((q) => (
              <div
                key={q}
                onClick={() => {
                  onChange(q);
                  setOpen(false);
                }}
                className="px-2 py-1 text-sm cursor-pointer hover:bg-gray-100"
              >
                {q}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!children && (
        <DialogTrigger className="w-full">
          <div className="mt-4 flex items-start gap-4">
            <Image
              alt=""
              src={previewImage}
              height={100}
              width={100}
              className="rounded-lg max-h-[100px] bg-[var(--comp-1)] object-contain border-1"
            />
            <div className="text-left text-sm md:text-base">
              <h3>{recipe.name || recipe.dish_name || recipe.title}</h3>
              {recipe.description && (
                <p className="leading-[1.2] text-[14px] text-black/60 mt-1 line-clamp-2">
                  {recipe.description}
                </p>
              )}
              {recipe.time && (
                <p className="mt-1">
                  {format(parse(recipe.time, "HH:mm", new Date()), "hh:mm a")}
                </p>
              )}
              {!recipe.time && recipe.meal_time && (
                <p className="mt-1">{recipe.meal_time}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1 overflow-x-auto no-scrollbar">
                {typeof recipe.calories === "object" ? (
                  <RecipeCalories recipe={recipe} />
                ) : (
                  <MealCalories recipe={recipe} />
                )}
              </div>
            </div>
          </div>
        </DialogTrigger>
      )}
      {children}
      <DialogContent className="p-0 gap-0 max-h-[70vh] overflow-y-auto">
        <DialogTitle className="p-4 border-b-1">Details</DialogTitle>
        <div className="p-4">
          <div
            className="relative w-full h-[250px] bg-[var(--comp-1)] rounded-lg overflow-hidden border-1 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Image
              alt=""
              src={previewImage}
              fill
              sizes="100vw"
              className="object-contain"
              onError={(e) => (e.currentTarget.src = "/not-found.png")}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-semibold transition">
              {uploading ? "Uploading..." : "Click to upload photo"}
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileRef}
              onChange={handleImageUpload}
            />
          </div>
          <div className="mt-2 mb-6 flex justify-between items-center">
            <SelectMealCollection index={index}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Search />
                  Search
                </Button>
              </DialogTrigger>
            </SelectMealCollection>
          </div>
          <FormControl
            value={formData.dish_name || formData.name || ""}
            name="dish_name"
            onChange={onChangeHandler}
            placeholder="Dish Name"
            className="block mb-4"
          />
          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              value={formData.description || ""}
              name="description"
              onChange={onChangeHandler}
              placeholder="Description"
              className="min-h-[80px] mb-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Ingredients
            </label>
            <Textarea
              value={formData.ingredients || ""}
              name="ingredients"
              onChange={onChangeHandler}
              placeholder="Enter ingredients (e.g., 2 eggs, 1 cup flour, etc.)"
              className="min-h-[100px] mb-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Method</label>
            <Textarea
              value={formData.method || ""}
              name="method"
              onChange={onChangeHandler}
              placeholder="Enter cooking method/instructions"
              className="min-h-[100px] mb-4"
            />
          </div>
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

            <div className="flex gap-2 items-center">
              <QuantityInput
                value={formData.quantity ?? 1}
                onChange={updateQuantity}
              />

              {backendMeasures.length ? (
                <Select
                  value={
                    formData.selected_measure_name ||
                    formData.default_measure?.name
                  }
                  onValueChange={(value) =>
                    onMeasureChange(value, formData.quantity || 1)
                  }
                >
                  <SelectTrigger className="min-w-[180px]">
                    <SelectValue placeholder="Select measure" />
                  </SelectTrigger>
                  <SelectContent>
                    {backendMeasures.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter measure (e.g. cup, bowl)"
                  value={formData.selected_measure_name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      selected_measure_name: e.target.value,
                      serving_size: `${prev.quantity || 1} ${e.target.value}`,
                    }))
                  }
                  className="min-w-[180px] px-2 py-1 border rounded-md focus:outline-none"
                />
              )}
            </div>
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
          <Button className="w-full mt-4" variant="wz" onClick={updateDish}>
            Save
          </Button>
          <DialogClose ref={closeBtnRef} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MealCalories({ recipe }) {
  return (
    <div className="flex flex-row flex-wrap gap-1">
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Serving Size -</span>
        {recipe?.serving_size}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Kcal -</span>
        {recipe?.calories}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Protien -</span> {recipe.protein}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Carbs -</span> {recipe.carbohydrates}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Fats -</span> {recipe.fats}
      </Badge>
      {recipe.measure !== undefined && (
        <Badge className="bg-[#EFEFEF] text-black">
          <span className="text-black/40">Measure -</span> {recipe.measure}
        </Badge>
      )}
    </div>
  );
}

function RecipeCalories({ recipe }) {
  return (
    <div className="flex flex-row flex-wrap gap-1">
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Protien -</span>{" "}
        {recipe?.calories?.proteins}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Carbs -</span> {recipe?.calories?.carbs}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Fats -</span> {recipe?.calories?.fats}
      </Badge>
      <Badge className="bg-[#EFEFEF] text-black">
        <span className="text-black/40">Kcal -</span>
        {recipe?.calories?.total}
      </Badge>
    </div>
  );
}
