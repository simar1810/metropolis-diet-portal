"use client"
import { Input } from "../ui/input";
import { ChevronDown, LogOut, Search, Menu } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "../ui/avatar";
import NotificationModal from "../modals/NotificationModal";
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { destroy } from "@/providers/global/slices/coach";
import { toast } from "sonner";
import PersonalBranding from "../modals/app/PersonalBranding";
import { permit } from "@/lib/permit";
import { useSWRConfig } from "swr";
import { ClientSearchBar } from "./AppSidebar";
import useClickOutside from "@/hooks/useClickOutside";
import { useSidebar } from "../ui/sidebar";

const COACH_WEBSITE_BASE_LINK = "https://coaches.wellnessz.in";

export default function AppNavbar() {
  const [Modal, setModal] = useState();
  const {toggleSidebar} = useSidebar()
  const data = useAppSelector(state => state.coach.data)
  if (!data) return <></>

  const { profilePhoto, name } = data;
  const openSidebar = () => {
    toggleSidebar();
  }
  return <nav className="bg-white sticky top-0 py-4 px-4 md:px-10 flex items-center justify-between border-b-1 z-[30]">
    <div>
      <Menu onClick={openSidebar} size={30} className="text-gray-400 font-normal md:hidden" />
    </div>
    {/* <SearchBar /> */}
    <div className="flex items-center justify-end gap-4 ">
    {Modal || <></>}
    <ClientSearchBar setModal={setModal} />
    <NotificationModal />
    <UserOptions
      profilePhoto={profilePhoto}
      name={name}
      />
      </div>
  </nav>
}

export function useExpireUserSession() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return async function expireUserSession() {
    try {
      const response = await fetch("/api/logout", { method: "DELETE" });
      const data = await response.json();
      if (data.status_code !== 200) throw new Error(data.message);
      dispatch(destroy());
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Please try again later");
    }
  };
}
const features = [
  { id: 1, title: "Meal", link: "/coach/meals/list" },
  { id: 2, title: "Recipes", link: "/coach/meals/recipes" },
  { id: 3, title: "Meetings", link: "/coach/club/meetings" },
  { id: 4, title: "Link Generator", link: "/coach/club/link-generator" },
  { id: 5, title: "Notes", link: "/coach/tools/notes" },
  { id: 6, title: "Reminders", link: "/coach/tools/reminders" },
  { id: 7, title: "Calorie Counter", link: "/coach/tools/calorie-counter" },
  { id: 8, title: "Ideal Weight", link: "/coach/tools/ideal-weight" },
  { id: 9, title: "Workout", link: "/coach/tools/workouts" },
  { id: 10, title: "Feed", link: "/coach/feed" },
  { id: 11, title: "Clients", link: "/coach/clients" },
]

export function SearchBar() {
  return
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [previousSearches, setPreviousSearces] = useLocalStorage("searches");

  const router = useRouter();
  const containerRef = useRef();

  const parsedDataLocalStorage = JSON.parse(previousSearches || "[]");

  function storeInhistory(link, title) {
    const newResults = parsedDataLocalStorage
      .filter(feature => feature.link !== link)
      .map((feature, index) => ({ ...feature, id: index }));
    setPreviousSearces(JSON.stringify([...newResults, { id: parsedDataLocalStorage.length, title, link }]));
    router.push(link);
    setOpen(false);
    setQuery("");
  }

  const queriedFeatures = features
    .filter(feature => feature.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const localStorageSearches = parsedDataLocalStorage
    .filter(feature => feature.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return <div className="bg-[var(--dark-4)] px-2 pt-10">
    <div ref={containerRef} className="w-full mx-auto z-[111] relative">
      <Search className="w-[18px] h-[18px] text-[#808080] absolute left-2 top-1/2 translate-y-[-50%]" />
      <Input
        onClick={() => {
          setOpen(!open);
        }}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search Feature..."
        className="bg-[var(--dark-1)] md:max-w-[450px] pl-8 !focus:outline-none border-1 border-[#808080]/40 focus:bg-black"
      />
      {open && <div className="max-w-[450px] w-full bg-black text-white absolute top-12 p-4 rounded-[8px] border-1">
        {queriedFeatures.length > 0 && <h3 className="mb-2">Suggested</h3>}
        {queriedFeatures.map(item => <SearchItem
          key={item.id}
          link={item.link}
          title={item.title}
          storeInhistory={storeInhistory}
        />)}
        {localStorageSearches.length > 0 && <h3 className="my-2">Previously Searched</h3>}
        {localStorageSearches.map(item => <SearchItem
          key={item.id}
          link={item.link}
          title={item.title}
          storeInhistory={storeInhistory}
        />)}
        {queriedFeatures.length === 0 && localStorageSearches.length === 0 && <div className="min-h-[200px] font-bold flex items-center justify-center">
          No Results Found!
        </div>}
      </div>}
    </div>
    {open && <div className="h-screen w-screen bg-[var(--dark-1)]/20 backdrop-blur-[4px] fixed top-0 left-0 z-[110]" />}
  </div>
}

function SearchItem({
  link,
  title,
  storeInhistory
}) {
  return <div
    onClick={() => storeInhistory(link, title)}
    className="text-[var(--primary-1)]/50 hover:text-[var(--primary-1)] text-[14px] mb-2 flex items-center gap-2 cursor-pointer"
  >
    <Search className="w-[16px] h-[16px]" />
    {title}
  </div>
}

function UserOptions({ profilePhoto, name }) {
  const [Modal, setModal] = useState();
  const [opened, setOpened] = useState(false)
  const { coachId, roles } = useAppSelector(state => state.coach.data);
  const dispatchRedux = useAppDispatch();
  const { cache } = useSWRConfig();

  const dropDownContentRef = useRef()

  useClickOutside(dropDownContentRef, () => {
    setOpened(false)
  })

  const personalizationpermitted = permit("app-personalization", roles);

  const router = useRouter();

  async function expireUserSession() {
    try {
      const response = await fetch("/api/logout", { method: "DELETE" });
      const data = await response.json();
      if (data.status_code !== 200) throw new Error(data.message);
      for (const [field] of cache.entries()) {
        cache.delete(field)
      }
      dispatchRedux(destroy());
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "Please try again later")
    }
  }

  return <>
    {Modal || <></>}
    <DropdownMenu open={opened}>
      <DropdownMenuTrigger
        onClick={() => setOpened(!opened)}
      >
        <div className="px-4 py-2 flex items-center gap-2 border-1 rounded-[8px]">
          <Avatar className="w-[24px] h-[24px] border-1  border-[var(--accent-1)]">
            <AvatarImage src={profilePhoto} />
            <AvatarFallback className="bg-[#172A3A] text-white uppercase">{name.split(" ").map(letter => letter[0]).join("")}</AvatarFallback>
          </Avatar>
          <p className="hidden md:block text-[var(--dark-1)]/50 text-[14px] leading-[1] font-[500]">{name}</p>
          <ChevronDown className="w-[16px] h-[16px]" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent ref={dropDownContentRef}>
        {personalizationpermitted && <DropdownMenuItem
          onClick={() => setModal(<PersonalBranding
            onClose={() => {
              setModal()
              setOpened(false)
            }}
          />)}
        >
          <DropdownMenuLabel className="text-[14px] py-0">
            App personalisation
          </DropdownMenuLabel>
        </DropdownMenuItem>}
        <DropdownMenuItem onClick={() => setOpened(false)}>
          <Link href={`${COACH_WEBSITE_BASE_LINK}/${coachId}`} target="_blank" className="w-full">
            <DropdownMenuLabel className="text-[14px] py-0">
              Your Website
            </DropdownMenuLabel>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setOpened(false)}>
          <Link href="/coach/portfolio" className="w-full">
            <DropdownMenuLabel className="text-[14px] py-0">
              Portfolio
            </DropdownMenuLabel>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={expireUserSession}>
          <DropdownMenuLabel className="text-[14px] text-[var(--accent-2)] py-0 flex items-center gap-2 cursor-pointer">
            <LogOut className="w-[12px] h-[12px] text-[var(--accent-2)]" />
            Logout
          </DropdownMenuLabel>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </>
}