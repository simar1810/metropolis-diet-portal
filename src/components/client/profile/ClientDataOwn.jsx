"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getClientMealPlanById, getClientNextMarathonClient, getWorkoutForClient } from "@/lib/fetchers/app";
import { CalendarIcon } from "lucide-react";
import useSWR from "swr";
import { useAppSelector } from "@/providers/global/hooks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ClientStatisticsDataOwn from "./ClientStatisticsDataOwn";
import { cn } from "@/lib/utils";
import { CustomMealDetails, WorkoutDetails } from "@/components/pages/coach/client/ClientData";

export default function ClientDataOwn({ clientData }) {
  return <div className="bg-white p-4 rounded-[18px] border-1 w-[90vw] md:w-auto">
    <Tabs defaultValue="statistics">
      <Header />
      <ClientStatisticsDataOwn clientData={clientData} />
      <ClientMealData _id={clientData._id} />
      {/* {organisation.toLowerCase() === "herbalife" && <ClientRetailData clientId={clientData.clientId} />} */}
      {/* <ClientClubDataComponent clientData={clientData} /> */}
      <MarathonData clientData={clientData} />
      <WorkoutContainer id={clientData._id} />
    </Tabs>
  </div>
}

function ClientMealData({ _id }) {
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
    />)}
    {meals.length === 0 && <ContentError title="No Meal plan assigned to this client" />}
  </TabsContent>
}

function MarathonData() {
  const { isLoading, error, data } = useSWR(
    "client/marathon",
    () => getClientNextMarathonClient(format(new Date(), "dd-MM-yyyy"))
  );
  if (isLoading) return <TabsContent value="marathon">
    <ContentLoader />
  </TabsContent>

  if (error || !Boolean(data) || data?.status_code !== 200) return <TabsContent value="retail">
    <ContentError className="mt-0" title={error || data?.message} />
  </TabsContent>
  const marathons = data.data;

  const totalPoints = marathons.reduce((acc, marathon) => acc + marathon.totalPoints, 0)

  return <TabsContent value="marathon">
    <div className="flex items-center justify-between">
      <h3 className="text-[var(--dark-1)] font-semibold text-lg">Marathon Tasks</h3>
    </div>
    <p className="mb-8 px-2 pt-1">{totalPoints} points</p>
    <div className="w-full max-w-3xl mx-auto">
      <Accordion defaultValue={1} type="single" collapsible className="space-y-2">
        {marathons.map((marathon, index) => (
          <AccordionItem className="bg-[var(--comp-1)] border-0" key={index} value={index + 1}>
            <AccordionTrigger className="bg-[var(--dark-1)]/10 text-left font-semibold text-lg p-4">
              {marathon.marathonTitle} ({marathon.date})
            </AccordionTrigger>
            <p className="px-4 py-2">{marathon.totalPoints} points</p>
            <AccordionContent>
              <div className="space-y-4 px-4 mt-2">
                {marathon.tasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="bg-white p-4 border rounded-lg"
                  >
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="text-sm mt-2 flex flex-wrap gap-3">
                      <span>🎯 Points: {task.points}</span>
                      <span>📽 Video: {task.videoSubmission ? 'Yes' : 'No'}</span>
                      <span>📷 Photo: {task.photoSubmission ? 'Yes' : 'No'}</span>
                      <span>{task.isCompleted ? '✅ Completed' : '❌ Incomplete'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </TabsContent>
}

function Header() {
  return <TabsList className={cn("w-full bg-transparent p-0 mb-4 grid border-b-2 rounded-none", false ? "grid-cols-5" : "grid-cols-4")}>
    <TabsTrigger
      className="mb-[-5px] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
      value="statistics"
    >
      Statistics
    </TabsTrigger>
    <TabsTrigger
      className="mb-[-5px] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
      value="meal"
    >
      Meal
    </TabsTrigger>
    <TabsTrigger
      className="mb-[-5px] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
      value="workout"
    >
      Workout
    </TabsTrigger>
    {/* {organisation.toLowerCase() === "herbalife" && <TabsTrigger
      className="mb-[-5px] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
      value="retail"
    >
      Retail
    </TabsTrigger>} */}
    <TabsTrigger
      className="mb-[-5px] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
      value="marathon"
    >
      Marathon
    </TabsTrigger>
    {/* <TabsTrigger
      className="mb-[-5px] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
      value="club"
    >
      Club
    </TabsTrigger> */}
  </TabsList>
}

function DatePicker({ date, setDate }) {
  return <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-[220px] justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date || <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={date}
        onSelect={value => setDate(format(value, "dd-MM-yyyy"))}
        initialFocus
      />
    </PopoverContent>
  </Popover>
}

function WorkoutContainer() {
  const { _id } = useAppSelector(state => state.client.data)
  const { isLoading, error, data } = useSWR("client/workouts", () => getWorkoutForClient(_id));
  if (isLoading) return <TabsContent value="workout">
    <ContentLoader />
  </TabsContent>

  if (error || !Boolean(data) || data?.status_code !== 200) return <TabsContent value="workout">
    <ContentError className="mt-0" title={error || data?.message} />
  </TabsContent>
  const workouts = data.data;

  return <TabsContent value="workout">
    {workouts && workouts?.map((workout, index) => <WorkoutDetails
      key={index}
      workout={workout}
    />)}
  </TabsContent>
}