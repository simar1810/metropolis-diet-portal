import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { nameInitials } from "@/lib/formatter";
import { vpDaysPending } from "@/lib/utils";
import { CircleAlert, CircleArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClientListVolumePoint({
  client,
  activePoints
}) {
  const daysRemaining = vpDaysPending(activePoints);

  return <div className="mb-1 px-4 py-2 flex items-center gap-4">
    <Avatar className="w-[48px] h-[48px] !rounded-[8px]">
      <AvatarImage className="rounded-[8px]" src={client.profilePhoto || "/"} />
      <AvatarFallback className="rounded-[8px] uppercase">
        {nameInitials(client.name || "")}
      </AvatarFallback>
    </Avatar>
    <div className="grow">
      <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
        <p className="text-[14px] font-semibold">{client.name}</p>
        {daysRemaining > 5
          ? <div className="text-[10px] font-semibold text-[var(--accent-1)]">
            {parseInt(activePoints)}&nbsp;Points Remaining |&nbsp;{parseInt(daysRemaining)}&nbsp;Days Remaining
          </div>
          : <div className="text-[var(--accent-2)] flex items-center gap-2">
            <CircleAlert fill="#FF1D1D" className="w-[14px] h-[14px] text-white" />
            <div className="text-[10px] font-semibold">
              {parseInt(activePoints)}&nbsp;Points Remaining |&nbsp;{parseInt(daysRemaining)}&nbsp;Days Remaining
            </div>
          </div>}
      </div>
      <Progress value={parseInt(daysRemaining)} className="w-full mt-2 [&_.progress-bar]:bg-[var(--accent-1)]" />
    </div>
    {/* {client.isVerified && <Link
      className="text-[12px] text-[var(--accent-1)] font-semibold ml-auto"
      href={"/coach/clients/" + client._id}
    >
      <CircleArrowRight className="w-[20px]" />
    </Link>} */}
  </div>
}