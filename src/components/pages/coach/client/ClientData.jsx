"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import FormControl from "@/components/FormControl";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchData, sendData } from "@/lib/api";
import { getClientMealPlanById, getClientOrderHistory, getClientWorkouts, getMarathonClientTask } from "@/lib/fetchers/app";
import { trimString } from "@/lib/formatter";
import { customMealDailyPDFData } from "@/lib/pdf";
import { youtubeVideoId } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { format } from "date-fns";
import { BarChart2, Bot, Briefcase, CalendarIcon, Clock, Dumbbell, Eye, FileDown, FileText, Flag, MoreVertical, ShoppingBag, Users, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import PDFRenderer from "@/components/modals/PDFRenderer";
import DisplayClientQuestionaire from "../questionaire/display/DisplayClientQuestionaire";
import Loader from "@/components/common/Loader";

const tabItems = [
  { icon: <Utensils className="w-[16px] h-[16px]" />, value: "meal", label: "Meal" },
  { icon: <CalendarIcon className="w-[16px] h-[16px]" />, value: "appointment", label: "Appointment" },
]

export default function ClientData({ clientData }) {
  const router = useRouter();
  const pathname = usePathname();

  const params = useSearchParams();
  const selectedTab = tabItems.map(item => item.value).includes(params.get("tab"))
    ? params.get("tab")
    : "meal"

  function tabChange(value) {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("tab", value);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  return <div className="bg-white h-auto px-2 py-4 md:p-4 rounded-[18px] border-1">
    <Tabs defaultValue={selectedTab} onValueChange={tabChange}>
      <Header />
      <ClientMealData _id={clientData._id} client={clientData} />
      <TabsContent value="appointment">
        <AppointmentTab clientId={clientData._id} />
      </TabsContent>
    </Tabs>
  </div>
}

function ClientMealData({ _id, client }) {
  const { isLoading, error, data } = useSWR(`app/getClientMealPlanById?clientId=${_id}`, () => getClientMealPlanById(_id));

  if (isLoading) return <TabsContent value="meal">
    <ContentLoader />
  </TabsContent>

  if (error || data.status_code !== 200) return <TabsContent value="meal">
    <ContentError className="mt-0" title={error || data.message} />
  </TabsContent>
  const meals = data?.data?.plans || data?.data || [];
  return <TabsContent value="meal">
    {meals && meals?.map((meal, index) => <CustomMealDetails
      key={index}
      meal={meal}
      client={client}
    />)}
    {meals.length === 0 && <ContentError title="No Meal plan assigned to this client" />}
  </TabsContent>
}

export function CustomMealDetails({ meal, client }) {
  if (meal.custom) return <div className="relative border-1 rounded-[10px] overflow-clip block mb-4">
    <Link href={`/coach/meals/list-custom/${meal._id}`} className="block">
      <Image
        alt=""
        src={meal.image || "/not-found.png"}
        height={400}
        width={400}
        className="w-full object-cover max-h-[200px]"
      />
      {/* <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Custom</Badge> */}
    </Link>
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h3>{meal.title}</h3>
        {/* <div className="flex items-center gap-2"> */}
        {/* <MealPDFGenerator meal={meal} client={client} /> */}
        {/* <Badge className="capitalize">{meal.mode}</Badge> */}
        {/* </div> */}
      </div>
      <p>{trimString(meal.description, 80)}</p>
    </div>
  </div>
  if (meal?.isRoutine) return <Link href={`/coach/meals/list/${meal._id}`} className="relative border-1 rounded-[10px] overflow-clip block mb-4">
    <Image
      alt=""
      src={meal.image || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Routine</Badge>
    <div className="p-4">
      <h3 className="mb-2">{meal.name}</h3>
      <p className="text-sm leading-tight">{trimString(meal.description, 80)}</p>
    </div>
  </Link>
}

function MealPDFGenerator({ meal, client }) {
  const coach = useAppSelector(state => state.coach.data);
  const coachName = coach?.name || "";

  const defaultVariant = useMemo(() => {
    if (meal?.mode === "weekly") return "landscape";
    if (meal?.mode === "monthly") return "compact";
    return "portrait";
  }, [meal?.mode]);

  const [selectedPdfVariant, setSelectedPdfVariant] = useState(defaultVariant);
  const [includeMacros, setIncludeMacros] = useState(true);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeGuidelines, setIncludeGuidelines] = useState(true);
  const [includeSupplements, setIncludeSupplements] = useState(true);

  const pdfData = useMemo(() => {
    if (!meal) return null;
    return customMealDailyPDFData(meal, null, { name: coachName }, { includeMacros, includeDescription, includeGuidelines, includeSupplements, client });
  }, [coachName, meal, includeMacros, includeDescription, includeGuidelines, includeSupplements, client]);

  const pdfTemplateMap = {
    portrait: "PDFCustomMealPortrait",
    landscape: "PDFCustomMealLandscape",
    compact: "PDFCustomMealCompactLandscape",
    compactPortrait: "PDFCustomMealCompactPortrait",
  };

  const pdfDisabled = !pdfData || !pdfData?.plans?.some(plan => Array.isArray(plan?.meals) && plan.meals.length > 0);
  const pdfTemplateKey = pdfTemplateMap[selectedPdfVariant] || "PDFDailyMealSchedule";

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <PDFRenderer pdfTemplate={pdfTemplateKey} data={pdfData || {}}>
        <DialogTrigger
          className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={pdfDisabled}
        >
          <FileDown className="w-5 h-5" />
        </DialogTrigger>
      </PDFRenderer>

      <Select
        value={selectedPdfVariant}
        onValueChange={setSelectedPdfVariant}
        disabled={pdfDisabled}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs hidden md:flex">
          <SelectValue placeholder="Layout" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="portrait">Portrait Overview</SelectItem>
          <SelectItem value="landscape">Landscape Matrix</SelectItem>
          <SelectItem value="compact">Compact Landscape</SelectItem>
          <SelectItem value="compactPortrait">Compact Portrait</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={pdfDisabled}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            checked={includeMacros}
            onCheckedChange={setIncludeMacros}
            onSelect={(e) => e.preventDefault()}
          >
            Show Macros
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={includeDescription}
            onCheckedChange={setIncludeDescription}
            onSelect={(e) => e.preventDefault()}
          >
            Show Description
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={includeGuidelines}
            onCheckedChange={setIncludeGuidelines}
            onSelect={(e) => e.preventDefault()}
          >
            Show Guidelines
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={includeSupplements}
            onCheckedChange={setIncludeSupplements}
            onSelect={(e) => e.preventDefault()}
          >
            Show Supplements
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center font-bold cursor-pointer">
            Close
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function UpdateClientOrderAmount({ order }) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  async function updateRetailAmount() {
    try {
      setLoading(true);
      const response = await sendData(
        `app/client/retail-order/${order.clientId}`,
        { orderId: order._id, amount: value },
        "PUT"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="px-4 py-2 rounded-[10px] bg-[var(--accent-1)] font-bold text-white text-[14px]">Pay</DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1">Order Amount</DialogTitle>
      <div className="p-4">
        <p> Pending Amount - ₹{order.pendingAmount}</p>
        <FormControl
          label="Add Amount"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter Amount"
          className="block mt-4"
        />
        <Button
          variant="wz"
          className="block mt-4"
          disabled={loading}
          onClick={updateRetailAmount}
        >
          Update
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}

function Header() {
  const { organisation, features } = useAppSelector(state => state.coach.data);
  return <TabsList className="w-full h-auto bg-transparent p-0 mb-10 flex items-start gap-x-2 gap-y-3 flex-wrap rounded-none no-scrollbar">
    {tabItems.map(({ icon, value, label, showIf }) => {
      if (showIf && !showIf({ organisation, features })) return null;
      return (
        <TabsTrigger
          key={value}
          className="min-w-[110px] mb-[-5px] px-2 font-semibold flex-1 basis-0 flex items-center gap-1 rounded-[10px] py-2
             data-[state=active]:bg-[var(--accent-1)] data-[state=active]:text-[var(--comp-1)]
             data-[state=active]:shadow-none text-[#808080] bg-[var(--comp-1)] border-1 border-[#EFEFEF]"
          value={value}
        >
          {icon}
          {label}
        </TabsTrigger>
      );
    })}
  </TabsList>
}

export function WorkoutDetails({ workout }) {
  if (workout.custom) return <Link
    href={`/coach/workouts/list-custom/${workout._id}`}
    className="relative border-1 rounded-[10px] overflow-clip block mb-4"
  >
    <Image
      alt=""
      src={workout?.image?.trim() || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Custom</Badge>
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h3>{workout.title}</h3>
        <Badge className="capitalize">{workout.mode}</Badge>
      </div>
      <p className="text-sm leading-tight mt-2">{trimString(workout.description, 80)}</p>
    </div>
  </Link>
  const routineWorkout = workout?.plans?.daily
  if (routineWorkout) return <Link
    href={`/coach/workouts/list/${routineWorkout._id}`}
    className="relative border-1 rounded-[10px] overflow-clip block mb-4"
  >
    <Image
      alt=""
      src={routineWorkout?.thumbnail?.trim() || "/not-found.png"}
      height={400}
      width={400}
      className="w-full object-cover max-h-[200px]"
    />
    <Badge className="absolute top-4 right-4 font-bold" variant="wz_fill">Routine</Badge>
    <div className="p-4">
      <h3 className="mb-2">{routineWorkout.title}</h3>
      <p className="text-sm leading-tight">{trimString(routineWorkout.instructions, 80)}</p>
    </div>
  </Link>
}

function AppointmentTab({ clientId }) {
  const { isLoading, error, data } = useSWR(
    `app/metropolis/schedule-appointment?clientId=${clientId}`,
    () => fetchData(`app/metropolis/client/schedule-appointment?clientId=${clientId}`)
  );

  if (isLoading) return <div className="h-[200px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <div className="h-[200px] flex items-center justify-center">
    {error || data.message}
  </div>

  const appointments = data.data || []

  if (appointments.length === 0) return <div className="h-[200px] bg-[var(--comp-1)] flex items-center justify-center border-1">
    No Appointment scheduled for this client.
  </div>

  return <div>
    {appointments.map(item => <Card
      key={item._id}
      className="border border-border/50 shadow-none hover:shadow-none transition bg-[var(--comp-1)]"
    >
      <CardContent className="p-4 py-2 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">{item.title}</h3>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {/* <Calendar className="h-3.5 w-3.5" /> */}
              {format(new Date(item.startsAt), "dd MMM yyyy")}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(item.startsAt), "hh:mm a")} – {format(new Date(item.endsAt), "hh:mm a")}
            </span>
          </div>
        </div>

        <Badge
          variant={
            item.status === "booked"
              ? "default"
              : item.status === "completed"
                ? "secondary"
                : "destructive"
          }
          className="capitalize text-xs"
        >
          {item.status}
        </Badge>
      </CardContent>
    </Card>
    )}
  </div>
}