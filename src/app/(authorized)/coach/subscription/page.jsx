"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllSubscriptions } from "@/lib/fetchers/app";
import { isAfter, parse } from "date-fns";
import useSWR from "swr";

const PlanTypeMap = {
  0: "Free Plan",
  1: "Basic Plan",
  2: "Pro Plan"
}

export default function Page() {
  const { isLoading, error, data } = useSWR("allCoachSubscriptions", getAllSubscriptions);

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const subscriptions = data.data?.appSubscriptions?.at(0)?.history;
  const { active = [], inactive = [] } = Object.groupBy(subscriptions, sub =>
    isAfter(parse(sub.endDate, 'dd-MM-yyyy', new Date()), new Date()) ? 'active' : 'inactive'
  );
  return <div className="content-container">
    <h4>Subscription</h4>
    <Tabs defaultValue="active">
      <Header />
      <TabsContent value="active">
        <div className="grid grid-cols-2 gap-4">
          {active.map((subscription, index) => <SubscriptionCard subscription={subscription} key={index} />)}
        </div>
      </TabsContent>
      <TabsContent value="inactive">
        <div className="grid grid-cols-2 gap-4">
          {inactive.map((subscription, index) => <SubscriptionCard subscription={subscription} key={index} />)}
        </div>
      </TabsContent>
      <TabsContent value="add-on">
        <div className="h-[100px] leading-[100px] text-center font-bold">
          No Add Ons
        </div>
      </TabsContent>
    </Tabs>
  </div>
}

function SubscriptionCard({ subscription }) {
  return <Card className="text-white bg-linear-to-r from-[var(--accent-1)] to-[#2F5613] gap-3">
    <CardHeader className="flex items-center gap-2 justify-between">
      <CardTitle className="text-[18px]">{PlanTypeMap[subscription.planCode]}</CardTitle>
      {/* <Badge variant="wz"></Badge> */}
    </CardHeader>
    <CardContent className="text-[14px] leading-[1.2]">
      <ul>
        <li className="mb-1">Start Date: {subscription.startDate}</li>
        <li className="mb-1">End Date: {subscription.endDate}</li>
        <li>Mode: {subscription.mode}</li>
      </ul>
    </CardContent>
  </Card>
}

function Header() {
  return <TabsList className="w-full h-auto bg-transparent p-0 my-4 flex justify-start border-y-2 rounded-none">
    <TabsTrigger
      className="mb-[-2px] max-w-[18ch] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)] py-[10px]"
      value="active"
    >
      Active
    </TabsTrigger>
    <TabsTrigger
      className="mb-[-2px] max-w-[18ch] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)] py-[10px]"
      value="inactive"
    >
      Inactive
    </TabsTrigger>
    <TabsTrigger
      className="mb-[-2px] max-w-[18ch] font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)] py-[10px]"
      value="add-on"
    >
      Add-Ons
    </TabsTrigger>
  </TabsList>
}