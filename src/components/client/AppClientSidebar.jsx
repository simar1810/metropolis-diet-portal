"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { useState } from "react";
import { sidebar__clientContent } from "@/config/data/client-sidebar";
import { Button } from "../ui/button";
import { destroyClient } from "@/providers/global/slices/client";
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks";
import { toast } from "sonner";

export default function AppClientSidebar() {
  const [Modal, setModal] = useState();
  const [loading, setLoading] = useState(false);
  const dispatchRedux = useAppDispatch();
  const { organisation } = useAppSelector(state => state.client.data)

  let sidebarItems = sidebar__clientContent;
  if (organisation !== "Herbalife") {
    sidebarItems = sidebarItems.filter(item => ![6].includes(item.id))
  }

  async function logoutuser() {
    try {
      setLoading(true);
      dispatchRedux(destroyClient());
      await fetch("/api/logout", { method: "DELETE" });
      window.location.href = "/client/login";
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sidebar className="w-[204px] bg-[var(--dark-4)] pl-2 pr-0 border-r-1">
      {Modal || <></>}
      <SidebarHeader className="bg-[var(--dark-4)] text-white font-cursive">
        <Image
          src="/wellnessz-white.png"
          alt="Metro Polis logo"
          width={659}
          height={125}
          className="max-w-[10ch] mx-auto mt-4"
        />
      </SidebarHeader>
      <SidebarContent className="bg-[var(--dark-4)] pr-2 pb-4 no-scrollbar">
        <SidebarGroup>
          <SidebarMenu className="px-0">
            {sidebarItems.map((item) => item.items && item.items.length > 0
              ? <SidebarItemWithItems
                key={item.id}
                item={item}
                Modal={Modal}
                setModal={setModal}
              />
              : <SidebarItem item={item} key={item.id} />)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-[var(--dark-4)] pr-4">
        <Button
          disabled={loading}
          onClick={logoutuser}
          className="bg-[var(--accent-2)] font-bold hover:bg-[var(--accent-2)] hover:opacity-60"
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarItemWithItems({ Modal, setModal, item }) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  return <DropdownMenu open={open} key={item.id}>
    <SidebarMenuItem className="py-[8px]">
      <DropdownMenuTrigger
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        asChild
        className="p-0 focus:border-nonefocus:outline-none focus:ring-0 data-[state=open]:ring-0 data-[state=open]:outline-none data-[state=open]:border-transparent"
      >
        <SidebarMenuButton className={`w-full !text-[var(--comp-4)] text-[14px] font-[500] px-2 py-[8px] ${pathname.includes(item.url) ? "bg-[var(--accent-1)] !text-[var(--dark-1)]" : "hover:text-white hover:!bg-[var(--dark-1)]"}`}>
          {item.icon}
          <span>{item?.title}</span>
          <ChevronRight className="absolute right-2 top-1/2 translate-y-[-50%]" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
        className="min-w-56 bg-[var(--dark-1)] rounded-none pl-6 pr-2 py-2 border-0 relative rounded-r-[8px]"
        sideOffset={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="h-full w-[16px] bg-[var(--dark-4)] absolute left-0 top-0" />
        {item.items.map(({ Component, ...item }) => (item.type === "modal"
          ? <DropdownMenuItem
            key={item.title}
            className={`!text-[var(--comp-4)] [&_.icon]:!text-[var(--comp-4)] text-[14px] mb-[2px] gap-2 cursor-pointer hover:!text-[var(--primary-1)] hover:[&_.icon]:!text-[var(--primary-1)] hover:!bg-[var(--dark-4)]`}
            onClick={() => setModal(<Component setModal={setModal} />)}
          >
            {item.icon}
            <span>{item.title}</span>
          </DropdownMenuItem>
          : <DropdownMenuItem
            asChild
            key={item.title}
            className={`!text-[var(--comp-4)] [&_.icon]:!text-[var(--comp-4)] text-[14px] mb-[2px] gap-2 ${pathname.includes(item.url) ? "bg-white !bg-[var(--accent-1)] !text-[var(--dark-1)] [&_.icon]:!text-[var(--dark-1)]" : "hover:!bg-[var(--dark-4)] hover:!text-[var(--comp-1)]  hover:[&_.icon]:!text-[var(--comp-1)]"}`}
          >
            <Link href={item.url}>
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>))}
      </DropdownMenuContent>
    </SidebarMenuItem>
  </DropdownMenu>
}

function SidebarItem({ item }) {
  const pathname = usePathname()
  return <SidebarMenuItem className="py-[8px]" key={item.id}>
    <SidebarMenuButton asChild>
      <Link
        href={item.url}
        className={`!text-[var(--comp-4)] text-[14px] font-[500] ${pathname === item.url ? "bg-[var(--accent-1)] !text-[var(--dark-1)]" : "hover:!bg-[var(--dark-1)] hover:!text-white"}`}
      >
        {item.icon}
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
}