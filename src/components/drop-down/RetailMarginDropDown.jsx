import { PenLine, Tag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export default function RetailMarginDropDown({
  margins,
  setMargin,
  setOpen,
  brand,
  children
}) {
  const [modalOpened, setModalOpened] = useState(false)
  return <DropdownMenu
    open={modalOpened}
    onOpenChange={() => setModalOpened(false)}
  >
    <DropdownMenuTrigger
      asChild
      onClick={() => setModalOpened(true)}
      className="absolute bottom-9 right-2"
    >
      <span>
        {children}
        {!children && <Badge
          variant="wz"
          className="font-bold badge opacity-100 md:opacity-0 cursor-pointer px-3 py-1 text-xs md:text-[10px] rounded-full shadow-sm"
        >
          <Tag />
          Sale
        </Badge>}
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start" sideOffset={10}>
      <DropdownMenuLabel className="font-bold">Select your margin</DropdownMenuLabel>
      {margins.map((margin, index) => <DropdownMenuItem
        key={index}
        checked={true}
        onClick={() => {
          setMargin(margin)
          setOpen(true)
          setModalOpened(false)
        }}
        className="cursor-pointer"
      >
        {margin}
      </DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>
}