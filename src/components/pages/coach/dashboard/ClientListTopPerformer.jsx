import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TopPerformerClientList({
  src,
  name,
  id
}) {
  return <Link className="mb-1 px-4 py-2 flex items-center gap-4"
    // className="w-[16px] h-[16px]"
    href={"/coach/clients/" + id}
  >
    <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
      <AvatarImage className="rounded-[8px]" src={src} />
      <AvatarFallback className="rounded-[8px]">{name.split(" ").slice(0, 2).map(word => word?.at(0)).join("")}</AvatarFallback>
    </Avatar>
    <p className="text-[14px] font-semibold">{name}</p>
    <ChevronRight className="w-[16px] h-[16px] ml-auto" />
  </Link>
}