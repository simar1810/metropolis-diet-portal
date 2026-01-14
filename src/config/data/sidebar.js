import QuickAddClient from "@/components/modals/add-client/QuickAddClient";
import AddClientWithCheckup from "@/components/modals/add-client/AddClientWithCheckup";
import {
  IndianRupee,
  Award,
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardPlus,
  Clock,
  Clock12,
  ContactRound,
  CreditCard,
  Dumbbell,
  FileChartColumn,
  FileCheck,
  FileText,
  Flame,
  Footprints,
  ForkKnife,
  Globe,
  Headset,
  Home,
  Hourglass,
  BadgeCheck,
  LayoutDashboard,
  Library,
  Link,
  List,
  ListTodo,
  Logs,
  MapPin,
  MessageCircle,
  Newspaper,
  PersonStanding,
  Plus,
  PlusCircle,
  Projector,
  Settings,
  Soup,
  Store,
  Sun,
  Tags,
  TrendingUp,
  Unlink,
  User,
  UserPlus,
  Users,
  Video,
  QrCode,
  Salad,
  Play
} from "lucide-react";
import { FaWeightScale } from "react-icons/fa6";
import CreateWorkoutModal from "@/components/modals/tools/CreateWorkoutModal";

export const sidebar__coachContent = [
  // {
  //   id: 1,
  //   title: "Home",
  //   icon: <Home className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/dashboard",
  //   permission: null, // Always visible
  // },
  // {
  //   id: 2,
  //   title: "Portfolio",
  //   icon: <User className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/portfolio",
  //   permission: 100, // Always visible
  // },
  {
    id: 3,
    title: "Clients",
    icon: <Users className="min-w-[20px] min-h-[20px]" />,
    url: "/coach/clients",
    permission: null, // Always visible
    // items: [
    //   {
    //     id: 1,
    //     icon: <Users className="icon min-w-[20px] min-h-[20px]" />,
    //     title: "All Clients",
    //     url: "/coach/clients",
    //   },
    //   {
    //     id: 2,
    //     icon: <FileChartColumn className="icon min-w-[20px] min-h-[20px]" />,
    //     title: "Reports",
    //     url: "/coach/reports"
    //   },
    //   {
    //     id: 3,
    //     icon: <PlusCircle className="icon min-w-[20px] min-h-[20px]" />,
    //     title: "Add Clients with Checkup",
    //     type: "modal",
    //     Component: AddClientWithCheckup,
    //   },
    //   {
    //     id: 4,
    //     icon: <UserPlus className="icon min-w-[20px] min-h-[20px]" />,
    //     title: "Quick Add",
    //     type: "modal",
    //     Component: QuickAddClient,
    //   },
    //   {
    //     id: 5,
    //     icon: <IndianRupee className="icon min-w-[20px] min-h-[20px]" />,
    //     title: "Invoices",
    //     url: "/coach/clients/invoices"
    //   }
    // ],
  },
  // {
  //   id: 3.5,
  //   title: "Users",
  //   icon: <Users className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/users",
  //   permission: "coach", // Only coaches can see this
  // },
  // {
  //   id: 4,
  //   title: "Meals & Recipes",
  //   icon: <Soup className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/meals",
  //   permission: 1, // Permission 1 = Meal Plan
  //   items: [
  //     {
  //       id: 1,
  //       icon: <Logs className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Add Meal Plan",
  //       url: "/coach/meals/add-custom",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Sun className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Daily",
  //           url: "/coach/meals/add-custom/daily",
  //         },
  //         {
  //           id: 2,
  //           icon: <CalendarDays className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Weekly",
  //           url: "/coach/meals/add-custom/weekly",
  //         },
  //         {
  //           id: 3,
  //           icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Monthly",
  //           url: "/coach/meals/add-custom/monthly",
  //         },
  //       ],
  //     },
  //     {
  //       id: 2,
  //       icon: <ClipboardPlus className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Meal Plan",
  //       url: "/coach/meals/list-custom",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Sun className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Daily",
  //           url: "/coach/meals/list-custom/?mode=daily",
  //         },
  //         {
  //           id: 2,
  //           icon: <CalendarDays className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Weekly",
  //           url: "/coach/meals/list-custom/?mode=weekly",
  //         },
  //         {
  //           id: 3,
  //           icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Monthly",
  //           url: "/coach/meals/list-custom/?mode=monthly",
  //         },
  //       ],
  //     },
  //     {
  //       id: 3,
  //       icon: <Hourglass className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Routine Meal Plan",
  //       url: "/coach/meals/list/",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <ForkKnife className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "All Plans",
  //           url: "/coach/meals/list/",
  //         },
  //         {
  //           id: 2,
  //           icon: <PlusCircle className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Add",
  //           url: "/coach/meals/add-plan",
  //         },
  //       ],
  //     },
  //     {
  //       id: 4,
  //       icon: <Soup className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Recipes",
  //       url: "/coach/meals/recipes",
  //     },
  //     {
  //       id: 5,
  //       icon: <Salad className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "AI Generation",
  //       url: "/coach/meals/ai",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Sun className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Daily",
  //           url: "/coach/meals/ai/daily",
  //         },
  //         {
  //           id: 2,
  //           icon: <CalendarDays className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Weekly",
  //           url: "/coach/meals/ai/weekly",
  //         },
  //         {
  //           id: 3,
  //           icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Monthly",
  //           url: "/coach/meals/ai/monthly",
  //         },
  //       ]
  //     },
  //   ]
  // }
  // ],
  // },
  // {
  //   id: 5,
  //   title: "Feed",
  //   icon: <Newspaper className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/feed",
  //   permission: 2, // Permission 2 = Feed
  // },
  // {
  //   id: 6,
  //   title: "Wallet",
  //   icon: <CircleDollarSign className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/wallet",
  //   permission: 3, // Permission 3 = Wallet
  //   items: [
  //     {
  //       id: 1,
  //       icon: <CircleDollarSign className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Overview",
  //       url: "/coach/wallet",
  //     },
  //     {
  //       id: 2,
  //       icon: <FileText className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Transactions",
  //       url: "/coach/wallet/transactions",
  //     },
  //     {
  //       id: 3,
  //       icon: <TrendingUp className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Analytics",
  //       url: "/coach/wallet/analytics",
  //     },
  //     {
  //       id: 4,
  //       icon: <Link className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Create Payment Link",
  //       url: "/coach/payments/create",
  //     },
  //     {
  //       id: 5,
  //       icon: <ListTodo className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Manage Payments",
  //       url: "/coach/payments/manage",
  //     },
  //     {
  //       id: 6,
  //       icon: <Tags className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Discount Vouchers",
  //       url: "/coach/payments/vouchers",
  //     },
  //     {
  //       id: 7,
  //       icon: <Award className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Rewards",
  //       url: "/coach/payments/rewards",
  //     },
  //     // {
  //     //   id: 8,
  //     //   icon: <Settings className="icon min-w-[20px] min-h-[20px]" />,
  //     //   title: "Settings",
  //     //   url: "/coach/wallet/settings",
  //     // },
  //   ],
  // },

  // {
  //   id: 7,
  //   title: "Retail",
  //   icon: <Store className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/retail",
  //   permission: 4, // Permission 4 = Retail
  // },
  // {
  //   id: 8,
  //   title: "Chats",
  //   icon: <MessageCircle className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/chats",
  //   permission: 5, // Permission 5 = Chats
  // },
  // {
  //   id: 9,
  //   title: "Workout",
  //   icon: <PersonStanding className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/workouts",
  //   permission: 6, // Permission 6 = Workout
  //   items: [
  //     {
  //       id: 1,
  //       icon: <Logs className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Add Workouts",
  //       url: "/coach/workouts/add/",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Sun className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Daily",
  //           url: "/coach/workouts/add/daily",
  //         },
  //         {
  //           id: 2,
  //           icon: <CalendarDays className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Weekly",
  //           url: "/coach/workouts/add/weekly",
  //         },
  //         {
  //           id: 3,
  //           icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Monthly",
  //           url: "/coach/workouts/add/monthly",
  //         },
  //       ],
  //     },
  //     {
  //       id: 2,
  //       icon: <ClipboardPlus className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "View Workouts",
  //       url: "/coach/workouts/list-custom",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Sun className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Daily",
  //           url: "/coach/workouts/list-custom/?mode=daily",
  //         },
  //         {
  //           id: 2,
  //           icon: <CalendarDays className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Weekly",
  //           url: "/coach/workouts/list-custom/?mode=weekly",
  //         },
  //         {
  //           id: 3,
  //           icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
  //           title: "Monthly",
  //           url: "/coach/workouts/list-custom/?mode=monthly",
  //         },
  //       ],
  //     },
  //     {
  //       id: 3,
  //       icon: <Hourglass className="icon max-w-[20px] max-h-[20px]" />,
  //       title: "Routine Workouts Plan",
  //       url: "/coach/workouts/list/",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Dumbbell className="icon max-w-[20px] max-h-[20px]" />,
  //           title: "All Workouts",
  //           url: "/coach/workouts/list/",
  //         },
  //         {
  //           id: 2,
  //           icon: <PlusCircle className="icon max-w-[20px] max-h-[20px]" />,
  //           title: "Add",
  //           type: "modal",
  //           Component: CreateWorkoutModal,
  //         },
  //       ],
  //     },
  //     {
  //       id: 4,
  //       icon: <Clock className="max-w-[20px] max-h-[20px]" />,
  //       title: "Sessions",
  //       url: "/coach/workouts/sessions",
  //       items: [
  //         {
  //           id: 1,
  //           icon: <Globe className="max-w-[20px] max-h-[20px]" />,
  //           title: "All Sessions",
  //           url: "/coach/workouts/sessions/list",
  //         },
  //         {
  //           id: 2,
  //           icon: <PlusCircle className="max-w-[20px] max-h-[20px]" />,
  //           title: "Add Session",
  //           url: "/coach/workouts/sessions/add",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 10,
  //   title: "Marathon",
  //   icon: <Footprints className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/marathons",
  //   permission: 7, // Permission 7 = Marathon
  // },
  // {
  //   id: 11,
  //   title: "Club",
  //   icon: <LayoutDashboard className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/club",
  //   permission: 8, // Permission 8 = Club
  //   items: [
  //     {
  //       id: 1,
  //       icon: <Projector className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Meetings",
  //       url: "/coach/club/meetings",
  //     },
  //     {
  //       id: 2,
  //       icon: <Link className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Link Generator",
  //       url: "/coach/club/link-generator",
  //     },
  //     {
  //       id: 3,
  //       icon: <ContactRound className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Membership",
  //       url: "/coach/club/membership",
  //     },
  //     // {
  //     //   id: 4,
  //     //   icon: <Video className="icon min-w-[20px] min-h-[20px]" />,
  //     //   title: "Zoom Settings",
  //     //   url: "/coach/club/zoom-settings"
  //     // },
  //     {
  //       id: 5,
  //       icon: <Soup className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Free Trial",
  //       url: "/coach/club/free-trial",
  //     },
  //     {
  //       id: 6,
  //       icon: <Unlink className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Coach Sync",
  //       url: "/coach/club/coach-sync",
  //     },
  //   ],
  // },
  // {
  //   id: 12,
  //   title: "Other Tools",
  //   icon: <Settings className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/tools",
  //   items: [
  //     {
  //       id: 1,
  //       icon: <FileCheck className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Notes",
  //       url: "/coach/tools/notes",
  //     },
  //     {
  //       id: 2,
  //       icon: <Clock12 className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Reminders",
  //       url: "/coach/tools/reminders",
  //     },
  //     {
  //       id: 3,
  //       icon: <Flame className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Calorie Counter",
  //       url: "/coach/tools/calorie-counter",
  //     },
  //     {
  //       id: 4,
  //       icon: <FaWeightScale className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Ideal Weight",
  //       url: "/coach/tools/ideal-weight",
  //     },
  //     {
  //       id: 5,
  //       icon: <CalendarRange className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Programs",
  //       url: "/coach/tools/programs",
  //     },
  //     {
  //       id: 9,
  //       icon: <Tags className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Categories",
  //       url: "/coach/tools/categories",
  //     },
  //     {
  //       id: 10,
  //       icon: <ListTodo className="icon min-w-[20px] min-h-[20px]" />,
  //       title: "Questionaire",
  //       url: "/coach/tools/questionaire"
  //     },
  //   ],
  // },
  // {
  //   id: 13,
  //   title: "Physical Club",
  //   icon: <MapPin className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/physical-club",
  //   // items: [
  //   //   {
  //   //     id: 1,
  //   //     icon: <BadgeCheck className="icon min-w-[20px] min-h-[20px]" />,
  //   //     title: "Memberships",
  //   //     url: "/coach/physical-club/memberships",
  //   //   },
  //   //   {
  //   //     id: 2,
  //   //     icon: <ClipboardCheck className="icon min-w-[20px] min-h-[20px]" />,
  //   //     title: "Attendance",
  //   //     url: "/coach/physical-club/attendance",
  //   //   },
  //   //   {
  //   //     id: 3,
  //   //     icon: <QrCode className="icon min-w-[20px] min-h-[20px]" />,
  //   //     title: "Generate QR",
  //   //     url: "/coach/physical-club/qr-generate",
  //   //   }
  //   // ]
  // },
  // {
  //   id: 14,
  //   icon: <Clock12 />,
  //   title: "Downline",
  //   url: "/coach/downline",
  //   permission: null
  // },
  // {
  //   id: 15,
  //   icon: <Play />,
  //   title: "Courses",
  //   url: "/coach/courses",
  //   permission: 15
  // }
];


export const sidebar__coachFooter = [
  // {
  // id: 1,
  // title: "Subscription",
  // icon: <CircleDollarSign className="min-w-[20px] min-h-[20px]" />,
  // url: "/coach/subscription",
  // },
  // {
  // id: 2,
  // title: "Support",
  // icon: <Headset className="min-w-[20px] min-h-[20px]" />,
  // url: "/coach/support",
  // },
  // {
  //   id: 3,
  //   title: "About",
  //   icon: <CircleAlert className="min-w-[20px] min-h-[20px]" />,
  //   url: "/coach/about"
  // },
];
