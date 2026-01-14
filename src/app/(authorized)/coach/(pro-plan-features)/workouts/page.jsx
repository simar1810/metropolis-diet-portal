"use client"
import { ClipboardList, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return <div className="content-container content-height-screen flex flex-col items-center justify-center">
    <div className="max-w-[450px]">
      <h4 className="w-full text-center pb-2 border-b-1">Workout</h4>
      <div className="mt-8 grid grid-cols-3 gap-4">
        <Link href="/coach/workouts/add?mode=daily" className="text-center bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <PlusCircle className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          Add Daily Workout
        </Link>
        <Link href="/coach/workouts/add?mode=weekly" className="text-center bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <PlusCircle className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          Add Weekly Workout
        </Link>
        <Link href="/coach/workouts/add?mode=monthly" className="text-center bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <PlusCircle className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          Add Monthly Workout
        </Link>
        <Link href="/coach/workouts/list" className="text-center bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <ClipboardList className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          View Routine Workout
        </Link>
        <Link href="/coach/workouts/list-custom" className="text-center bg-[var(--comp-1)] font-bold text-[14px] p-4 rounded-[8px] border-1 border-[var(--accent-1)]">
          <ClipboardList className="w-[64px] h-[64px] bg-[var(--accent-1)]/40 text-white p-3 mx-auto mb-2 rounded-full" fill="#00984A" />
          View Custom Workout
        </Link>
      </div>
    </div>
  </div>
}