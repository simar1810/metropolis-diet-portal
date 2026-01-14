"use client"
import { AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import Link from "next/link";
import ActivityTool from "./dashboard/ActivityTool";
import CoachMatrices from "./dashboard/CoachMatrices";

export default function Tools({
  data
}) {
  return <div className="mt-10">
    <h4 className="mb-4">Quick Star Tools</h4>
    <div className="flex gap-4">
      {/* <Card className="w-[180px] !border-1 !shadow-none rounded-[10px] border-1">
        <Link href="/coach/tools/calorie-counter" className="flex flex-col gap-2">
          <CardHeader className="text-[14px] font-semibold">Calorie Counter</CardHeader>
          <CardContent>
            <Avatar className="w-fit block mx-auto">
              <AvatarImage
                className="w-[64px] h-[64px]"
                src="/svgs/flame-icon.svg"
              />
            </Avatar>
            <p className="block text-center text-[var(--accent-1)] text-[14px] mt-2">Calculate Now</p>
          </CardContent>
        </Link>
      </Card>

      <Card className="w-[180px] !border-1 !shadow-none rounded-[10px] border-1">
        <Link href="/coach/tools/ideal-weight" className="flex flex-col gap-2">
          <CardHeader className="text-[14px] font-semibold">Ideal Weight</CardHeader>
          <CardContent>
            <Avatar className="w-fit block mx-auto">
              <AvatarImage
                className="w-[64px] h-[64px]"
                src="/svgs/weight-icon.svg"
              />
            </Avatar>
            <p href="/coach/tools/ideal-weight" className="block text-center text-[var(--accent-1)] text-[14px] mt-2">Check Now</p>
          </CardContent>
        </Link>
      </Card> */}
      <CoachMatrices />
    </div>
  </div>
}