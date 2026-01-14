"use client";

import { ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";

export default function AddRecipeModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-green-500 text-white font-bold px-4 py-2 rounded-full">
        Add Recipe
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] border-0 p-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            Add Recipe
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Recipe Name */}
            <div>
              <p className="text-sm mb-2">Recipe Name</p>
              <FormControl
                placeholder="Enter Name"
                className="w-full"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <p className="text-sm mb-2">Thumbnail</p>
              <div className="border border-gray-200 rounded-lg p-4 h-[120px] flex flex-col items-center justify-center text-gray-400">
                <ImagePlus size={24} className="mb-1" />
                <span className="text-sm">Add Image</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <p className="text-sm mb-2">Ingredients</p>
            <FormControl
              as="textarea"
              placeholder="Enter Details"
              className="w-full min-h-[120px]"
            />
          </div>

          {/* Instructions */}
          <div>
            <p className="text-sm mb-2">Instructions</p>
            <FormControl
              as="textarea"
              placeholder="Enter Details"
              className="w-full min-h-[120px]"
            />
          </div>

          {/* Nutritional Values */}
          <div>
            <p className="text-sm font-medium mb-4">Nutritional Values</p>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <FormControl
                  placeholder="Kcal"
                  className="w-full"
                />
                <p className="text-xs text-center mt-1">Calories</p>
              </div>
              <div>
                <FormControl
                  placeholder="gm"
                  className="w-full"
                />
                <p className="text-xs text-center mt-1">Proteins</p>
              </div>
              <div>
                <FormControl
                  placeholder="gm"
                  className="w-full"
                />
                <p className="text-xs text-center mt-1">Carbs</p>
              </div>
              <div>
                <FormControl
                  placeholder="gm"
                  className="w-full"
                />
                <p className="text-xs text-center mt-1">Fat</p>
              </div>
              <div>
                <FormControl
                  placeholder="gm"
                  className="w-full"
                />
                <p className="text-xs text-center mt-1">Fibers</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button className="w-full bg-[var(--accent-1)] hover:bg-green-600 text-white font-medium py-3 rounded-md">
              Add Recipe
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}