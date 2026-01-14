import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader
} from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { useAppSelector } from "@/providers/global/hooks";
import { useRouter } from "next/navigation";

export default function DashboardInfoCard({
  icon = "/svgs/users-icon.svg",
  title,
  quantity,
  isSubscribed,
  link
}) {
  const router = useRouter(link)
  return <div
    onClick={() => router.push(link)}
    className="relative overflow-clip border-1 rounded-[10px] cursor-pointer"
  >
    <Card className="px-0 py-4 shadow-none gap-2 rounded-[10px] border-0">
     <div className="flex md:flex-col">
      <CardHeader className="flex items-center justify-start">
        <Avatar className="w-[40px] h-[40px] rounded-none">
          <AvatarImage
            src={icon}
            className="w-[40px] h-[40px] !rounded-none"
          />
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="text-base md:text-[20px] font-bold">{quantity}</div>
        <p className="text-[9.9px] md:text-[11px] font-[600] text-[var(--dark-2)]">{title}</p>
      </CardContent>
     </div>
    </Card>
    {isSubscribed && <LockedFeature />}
  </div>
}

function LockedFeature() {
  const { _id } = useAppSelector(state => state.coach.data);

  return <div className="h-full w-full absolute top-0 left-0 backdrop-blur-[3px] flex items-center justify-center gap-2">
    <Lock className="w-[32px] h-[32px] text-white bg-[var(--accent-1)] p-[6px] rounded-full" />
    <div>
      <h5 className="text-[10px]">This feature is Locked</h5>
      <p className="leading-[1] text-[8px] mt-[2px]">Upgrade now to unlock</p>
      <Link target="_blank" href={`https://wellnessz.in/plans/${_id}`} className="w-fit text-[var(--accent-1)] text-[8px] font-semibold block mx-auto mt-1 px-[4px] py-1 border-1 border-[var(--accent-1)]">
        Upgrade
      </Link>
    </div>
  </div>
}