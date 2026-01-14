"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import useSWR from "swr";
import Loader from "../common/Loader";
import ContentError from "../common/ContentError";
import { getMeals, getRecipes } from "@/lib/fetchers/app";
import { nameInitials } from "@/lib/formatter";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { addNewRecipe, changeRecipeFieldValue } from "@/config/state-reducers/add-meal-plan";
import React, { useRef, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";

export default function AddRecipe({ recipe }) {
  const [query, searchQuery] = useState("");
  const dehouncedSearchQuery = useDebounce(query)
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <SelectRecipeImage recipe={recipe} />
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] max-h-[70vh] overflow-y-auto gap-0 border-0 p-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            Create Meal
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pt-4 pb-6 space-y-6">
          <div>
            <FormControl
              placeholder="Search Meals"
              className="w-full [&_.input]:bg-[var(--comp-1)] rounded-lg"
              onChange={e => searchQuery(e.target.value)}
              value={query}
            />
          </div>
          <div>
            <h3 className="font-medium mb-4">Select from our Meal Library</h3>
            {dehouncedSearchQuery && <RecipeesList
              id={recipe.id}
              searchQuery={dehouncedSearchQuery}
            />}
          </div>
          <Button variant="wz" className="block mt-10 mx-auto">
            Add your own Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ListRecipeCard({ recipe, id }) {
  const { dispatch } = useCurrentStateContext();

  const closeBtnRef = useRef();

  function triggerAddRecipe() {
    // closeBtnRef.current.click();
    dispatch(addNewRecipe({ ...recipe, id }))
  }

  return <div
    onClick={triggerAddRecipe}
    className="py-4 flex items-center gap-3 cursor-pointer"
  >
    <Avatar>
      <AvatarImage src={recipe.image || "/not-found.png"} />
      <AvatarFallback>{nameInitials(recipe.name)}</AvatarFallback>
    </Avatar>
    <span className="text-[12px] flex-1">{recipe.name}</span>
    <DialogClose ref={closeBtnRef} />
  </div>
}

const RecipeesList = React.memo(
  function ({ searchQuery = "", id }) {
    const { isLoading, error, data } = useSWR(`getMeals?query=${searchQuery}`, () => getMeals(searchQuery));

    if (isLoading) return <div className="w-full flex items-cener justify-center">
      <Loader />
    </div>

    if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
    const recipes = data.data;

    return <div className="grid grid-cols-2 gap-x-4 divide-y-1">
      {recipes.map((recipe, index) => <ListRecipeCard
        key={index}
        recipe={recipe}
        id={id}
      />)}
    </div>
  }
)

function SelectRecipeImage({ recipe }) {
  if (recipe.image) return <div className="bg-[var(--comp-1)] relative">
    <Image
      src={recipe.image || "/not-found.png"}
      alt=""
      height={200}
      width={200}
      className="w-full h-[120px] object-contain"
    />
  </div>
  return <div className="border border-dashed border-gray-400 py-[60px] mb-4">
    <p className="text-gray-500">Add your Meal</p>
  </div>

}