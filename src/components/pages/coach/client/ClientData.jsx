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
import { BarChart2, Bot, Briefcase, CalendarIcon, Clock, Dumbbell, Eye, FileDown, FileText, Flag, MoreVertical, ShoppingBag, TrendingUp, Users, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import PDFRenderer from "@/components/modals/PDFRenderer";
import DisplayClientQuestionaire from "../questionaire/display/DisplayClientQuestionaire";
import Loader from "@/components/common/Loader";
import { ChartContainer } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ADHERENCE_SCORE_RANGES = [
  {
    label: "Excellent",
    min: 80,
    max: 100,
    description: "You’re consistently performing at the top level and mastering your skills.",
  },
  {
    label: "Good",
    min: 60,
    max: 79,
    description: "You have a solid grasp and are on the right track, with room to improve.",
  },
  {
    label: "Average",
    min: 40,
    max: 59,
    description: "You’re doing okay, but there are key areas that need more focus.",
  },
  {
    label: "Below Average",
    min: 20,
    max: 39,
    description: "You may be struggling in some areas and should consider extra practice.",
  },
  {
    label: "Poor",
    min: 0,
    max: 19,
    description: "Significant improvement is needed; it’s time to reassess your approach and strategy.",
  },
];

const GAUGE_RADIUS = 90;
const GAUGE_LENGTH = Math.PI * GAUGE_RADIUS;

const tabItems = [
  { icon: <Utensils className="w-[16px] h-[16px]" />, value: "meal", label: "Meal" },
  { icon: <CalendarIcon className="w-[16px] h-[16px]" />, value: "appointment", label: "Appointment" },
  { icon: <Briefcase className="w-[16px] h-[16px]" />, value: "adherence", label: "Adherence", },
]

function getAdherenceRangeForScore(score) {
  return ADHERENCE_SCORE_RANGES.find(range => score >= range.min) || ADHERENCE_SCORE_RANGES[ADHERENCE_SCORE_RANGES.length - 1];
}

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
  console.log(clientData)
  return <div className="bg-white h-auto px-2 py-4 md:p-4 rounded-[18px] border-1">
    <Tabs defaultValue={selectedTab} onValueChange={tabChange}>
      <Header />
      <ClientMealData _id={clientData._id} client={clientData} />
      <TabsContent value="appointment">
        <AppointmentTab clientId={clientData._id} />
      </TabsContent>
      <TabsContent value="adherence">
        <ClientAdherenceScore clientId={clientData.clientId} />
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

function ClientAdherenceScore({ clientId }) {
  const [date, setDate] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

  const endpoint = useMemo(() => `app/client/adherence-score?person=coach&clientId=${clientId}`, [clientId])
  const { isLoading, error, data, mutate } = useSWR(
    endpoint, () => fetchData(endpoint)
  );


  const adherenceData = data?.data || {};
  const currentScore = adherenceData.adherenceScore;
  let history = adherenceData.adherenceScoreHistory || [];

  const formatDateHelper = (dateValue) => {
    if (!dateValue) return "";
    try {
      const dateObj = new Date(dateValue);
      if (isNaN(dateObj.getTime())) {
        if (typeof dateValue === "string" && dateValue.match(/^\d{2}-\d{2}-\d{4}$/)) {
          return dateValue;
        }
        return dateValue;
      }
      return format(dateObj, "dd-MM-yyyy");
    } catch {
      return dateValue;
    }
  };

  // Filter by date if selected
  if (date) {
    history = history.filter(item => {
      const itemDate = formatDateHelper(item.date);
      return itemDate === date;
    });
  }

  const handleDatePickerChange = (newDate) => {
    setDate(newDate);
    setPagination(prev => ({ page: 1, limit: prev.limit }));
  };

  const clearDateFilter = () => {
    setDate(null);
    setPagination(prev => ({ page: 1, limit: prev.limit }));
  };

  const parsedScore = parseFloat(currentScore);
  const hasScore = Number.isFinite(parsedScore);
  const normalizedScore = hasScore ? Math.min(Math.max(parsedScore, 0), 100) : 0;
  const targetRatio = hasScore ? normalizedScore / 100 : 0;
  const gradientId = useMemo(() => `adherence-gradient-${clientId}`, [clientId]);
  const [animatedRatio, setAnimatedRatio] = useState(0);
  const animationStartRef = useRef(null);
  const activeRange = hasScore ? getAdherenceRangeForScore(normalizedScore) : null;

  useEffect(() => {
    animationStartRef.current = null;
    let frame;
    const duration = 1200;
    const animate = (timestamp) => {
      if (animationStartRef.current === null) {
        animationStartRef.current = timestamp;
      }
      const elapsed = timestamp - animationStartRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedRatio(progress * targetRatio);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      animationStartRef.current = null;
    };
  }, [targetRatio]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Sort by date
    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return sortedHistory.map((item, index) => ({
      date: formatDateHelper(item.date),
      score: parseFloat(item.score) || 0,
      fullDate: item.date
    }));
  }, [history]);

  const getScoreColor = (label) => {
    switch (label) {
      case "Excellent": return "text-emerald-600";
      case "Good": return "text-green-600";
      case "Average": return "text-yellow-600";
      case "Below Average": return "text-orange-600";
      case "Poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (isLoading) return <Loader />

  if (error || !data || data?.status_code !== 200) return <div>
    <Button onClick={mutate}>Retry</Button>
    {error?.message || data?.message || "Error loading data"}
  </div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--dark-1)] mb-1">Adherence Score</h3>
          <p className="text-sm text-muted-foreground">
            Track your progress and consistency over time
          </p>
        </div>
        <Dialog open={isHistoryModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-xl font-bold mb-4">Adherence Score History</DialogTitle>
            {chartData.length > 0 ? (
              <div className="space-y-6">
                <div className="h-80 w-full">
                  <ChartContainer
                    config={{
                      score: {
                        label: "Adherence Score",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value.toFixed(1)}`, "Score"]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth={3}
                          fill="url(#scoreGradient)"
                          dot={{ fill: "rgb(59, 130, 246)", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="border-t pt-4">
                  <div className="max-h-64 overflow-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.slice().reverse().map((item, index) => {
                          const range = getAdherenceRangeForScore(item.score);
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.date}</TableCell>
                              <TableCell className="text-right font-semibold">{item.score.toFixed(1)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className={getScoreColor(range?.label)}>
                                  {range?.label || "N/A"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No history data available yet</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Gauge Section */}
          <div className="flex-1 max-w-md">
            <div className="flex flex-col items-center space-y-6">
              {/* Gauge */}
              <div className="relative w-full max-w-[320px] h-32">
                <svg viewBox="0 0 220 120" className="h-full w-full">
                  <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 110 A 90 90 0 0 1 200 110"
                    fill="transparent"
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 110 A 90 90 0 0 1 200 110"
                    fill="transparent"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray={GAUGE_LENGTH.toFixed(2)}
                    strokeDashoffset={(GAUGE_LENGTH * (1 - animatedRatio)).toFixed(2)}
                    style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
                  />
                </svg>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                <p className={`text-6xl font-bold ${getScoreColor(activeRange?.label)} mb-4`}>
                  {hasScore ? normalizedScore.toFixed(0) : "N/A"}
                </p>
                <Badge
                  variant="outline"
                  className={`text-base font-semibold px-4 py-2 ${getScoreColor(activeRange?.label)} border-current`}
                >
                  {activeRange?.label ?? "No Data"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Score Details Section */}
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[var(--dark-1)] mb-4">Score Breakdown</h4>
              <div className="space-y-3">
                {ADHERENCE_SCORE_RANGES.map(range => (
                  <div
                    key={range.label}
                    className={`p-3 rounded-lg border-2 transition-colors ${range.label === activeRange?.label
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-slate-50 hover:bg-slate-100"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${range.label === activeRange?.label
                            ? getScoreColor(range.label)
                            : "text-slate-700"
                            }`}>
                            {range.label}
                          </span>
                          {range.label === activeRange?.label && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {range.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {range.min}-{range.max}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}