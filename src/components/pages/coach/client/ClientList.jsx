import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  ChevronRight,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function ClientList({
  title = "Clients",
  type = 1
}) {
  const Component = type === 1
    ? ClientItemType1
    : ClientItemType2

  return <div className="bg-white py-4 rounded-[10px]">
    <div className="mb-4 px-4 flex items-center justify-between">
      <p className="text-[14px] font-bold">{title}</p>
      <Link
        href="/coach/add-client"
        className="bg-[var(--accent-1)] text-white text-[10px] font-semibold px-3 py-2 rounded-[4px]"
      >
        + Add Client
      </Link>
    </div>
    <div className="divide-y-1 divide-[#ECECEC]">
      {Array.from({ length: 4 }, (_, i) => i).map(item => <Component
        key={item}
        name="New Name"
      />)}
    </div>
  </div>
}

function ClientItemType1({
  src,
  name,
  id
}) {
  return <div className="mb-1 px-4 py-2 flex items-center gap-4">
    <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
      <AvatarImage className="rounded-[8px]" src={src} />
      <AvatarFallback className="rounded-[8px]">{name.split(" ").slice(0, 2).map(word => word?.at(0)).join("")}</AvatarFallback>
    </Avatar>
    <p className="text-[14px] font-semibold">{name}</p>
    <Link
      className="w-[16px] h-[16px] ml-auto"
      href={"/coach/client/" + id}
    >
      <ChevronRight className="w-[16px] h-[16px]" />
    </Link>
  </div>
}

function ClientItemType2({
  src,
  name,
  id
}) {
  return <div className="mb-1 px-4 py-2 flex items-center gap-4">
    <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
      <AvatarImage className="rounded-[8px]" src={src} />
      <AvatarFallback className="rounded-[8px]">{name.split(" ").slice(0, 2).map(word => word?.at(0)).join("")}</AvatarFallback>
    </Avatar>
    <p className="text-[14px] font-semibold">{name}</p>
    <Link
      className="text-[12px] text-[var(--accent-1)] font-semibold ml-auto p-2 flex items-center gap-1 border-1 border-[var(--accent-1)] rounded-[10px]"
      href={"/coach/client/" + id}
    >
      <Clock className="w-[14px] h-[14px]" />
      Schedule
    </Link>
  </div>
}