import { ClipboardList, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return <div className="content-container content-height-screen flex flex-col items-center justify-center">
    <div className="max-w-[450px]">
      <h4 className="w-full text-center pb-2 border-b-1">Meals & Recipes</h4>
      <div className="text-center mt-8 grid grid-cols-3 gap-4">
        <Link href="/coach/meals/add-custom" className="bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <PlusCircle className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          Add Meal Plan
        </Link>
        <Link href="/coach/meals/list" className="bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <ClipboardList className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          View Meal Plans
        </Link>
        <Link href="/coach/meals/recipes" className="bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <ClipboardList className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          Recipes
        </Link>
      </div>
    </div>
  </div>
}