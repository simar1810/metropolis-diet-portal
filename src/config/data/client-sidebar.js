import {
  CalendarRange,
  CircleDollarSign,
  Clock12,
  FileCheck,
  Flame,
  Footprints,
  Headset,
  Home,
  Logs,
  MessageCircle,
  Newspaper,
  PersonStanding,
  Settings,
  Soup,
  Store,
  User
} from "lucide-react";
import { FaWeightScale } from "react-icons/fa6";

export const sidebar__clientContent = [
  {
    id: 1,
    title: "Home",
    icon: <Home className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/dashboard"
  },
  {
    id: 2,
    title: "Profile",
    icon: <User className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/profile"
  },
  {
    id: 4,
    title: "Meals",
    icon: <Soup className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/meals",
    items: [
      // {
      //   id: 1,
      //   icon: <Logs className="icon min-w-[20px] min-h-[20px]" />,
      //   title: "View Meal Plans",
      //   url: "/client/app/meals/list"
      // }
    ]
  },
  {
    id: 5,
    title: "Feed",
    icon: <Newspaper className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/feed"
  },
  {
    id: 6,
    title: "Retail",
    icon: <Store className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/retail"
  },
  {
    id: 7,
    title: "Chats",
    icon: <MessageCircle className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/chats"
  },
  {
    id: 8,
    title: "Workout",
    icon: <PersonStanding className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/workouts"
  },
  {
    id: 9,
    title: "Next Marathon",
    icon: <Footprints className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/next-marathon"
  },
  {
    id: 10,
    title: "Wz Sessions",
    icon: <Footprints className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/sessions"
  },
  // {
  //   id: 10,
  //   title: "Club",
  //   icon: <LayoutDashboard className="min-w-[20px] min-h-[20px]" />,
  //   url: "/client/app/club",
  //   items: []
  // },
  {
    id: 11,
    title: "Tools",
    icon: <Settings className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/tools",
    items: [
      {
        id: 1,
        icon: <FileCheck className="icon min-w-[20px] min-h-[20px]" />,
        title: "Notes",
        url: "/client/app/tools/notes"
      },
      {
        id: 2,
        icon: <Clock12 className="icon min-w-[20px] min-h-[20px]" />,
        title: "Reminders",
        url: "/client/app/tools/reminders"
      },
      {
        id: 3,
        icon: <Flame className="icon min-w-[20px] min-h-[20px]" />,
        title: "Calorie Counter",
        url: "/client/app/tools/calorie-counter"
      },
      {
        id: 4,
        icon: <FaWeightScale className="icon min-w-[20px] min-h-[20px]" />,
        title: "Ideal Weight",
        url: "/client/app/tools/ideal-weight"
      },
      // {
      //   id: 5,
      //   icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
      //   title: "Programs",
      //   url: "/client/app/tools/programs"
      // },
    ]
  },
]

export const clientSidebar__coachFooter = [
  {
    id: 1,
    title: "Subscription",
    icon: <CircleDollarSign className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/subscription"
  },
  {
    id: 2,
    title: "Support",
    icon: <Headset className="min-w-[20px] min-h-[20px]" />,
    url: "/client/app/support"
  }
]