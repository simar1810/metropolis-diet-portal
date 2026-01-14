"use client";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { retrieveDownlineClientInformation } from "@/lib/fetchers/app";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabChange } from "@/lib/formatter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpdateDetails } from "../../coach/[id]/page";

const tabItems = [
  {
    id: 1,
    title: "Profile",
    value: "profile"
  },
  {
    id: 2,
    title: "Plan",
    value: "plans"
  },
  {
    id: 3,
    title: "Health Matrix",
    value: "health-matrix"
  },
  {
    id: 4,
    title: "Retail",
    value: "retail"
  },
]

export default function Page() {
  const { id: clientId } = useParams()

  const pathname = usePathname()
  const params = useSearchParams();
  const router = useRouter();

  const selectedTab = tabItems.map(item => item.value).includes(params.get("tab"))
    ? params.get("tab")
    : "profile"

  const { isLoading, error, data } = useSWR(
    `app/downline/client/${clientId}`,
    () => retrieveDownlineClientInformation({ clientId })
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const {
    profile = {},
    plans = [],
    stats = {},
    retail = []
  } = data?.data || {};

  return <div className="content-container content-height-screen">
    <Tabs defaultValue={selectedTab}
      onValueChange={value => tabChange(value, router, params, pathname)}
    >
      <TabsHeader />
      <TabsProfile profile={profile} />
      <TabsStats stats={stats.healthMatrix} />
      <TabsRetail retails={retail} />
      <TabsPlans plans={plans} />
    </Tabs>
  </div>
}

function TabsHeader() {
  return <TabsList className="bg-transparent flex items-center gap-4 mb-4">
    {tabItems.map(tab => <TabsTrigger
      key={tab.id}
      value={tab.value}
      className="text-[14px] md:text-[16px] text-[var(--accent-1)] data-[state=active]:bg-[var(--accent-1)] 
             data-[state=active]:text-[var(--comp-1)] border-1 rounded-[6px] border-[var(--accent-1)]
             bg-[var(--comp-2)] px-4 py-4 data-[state=active]:font-semibold"
    >
      {tab.title}
    </TabsTrigger>)}
  </TabsList>
}

function TabsProfile({ profile }) {
  return (
    <TabsContent
      value="profile"
      className="bg-[var(--comp-1)] border rounded-xl p-4"
    >
      <Card className="shadow-md rounded-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.profilePhoto} alt={profile.name} />
            <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{profile.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {profile.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <UpdateDetails
            actionType="UPDATE_CLIENT"
            title="Client Details"
            user={profile}
          />
        </CardHeader>

        <CardContent className="space-y-2">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Mobile</p>
            <p className="text-sm text-muted-foreground">{profile.mobileNumber}</p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

function TabsPlans({ plans = [] }) {
  return (
    <TabsContent
      value="plans"
      className="bg-[var(--comp-1)] border rounded-xl p-4"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan._id} className="rounded-xl shadow-md overflow-hidden">
            <div className="relative w-full h-40">
              <Image
                src={plan.image}
                alt={plan.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {plan.description || "No description"}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Meals</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {plan.meals?.map((meal, idx) => (
                  <li key={idx}>{meal.mealType}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>
  )
}

function TabsStats({ stats = [] }) {
  return (
    <TabsContent
      value="health-matrix"
      className="bg-[var(--comp-1)] border rounded-xl p-4"
    >
      <div className="bg-white overflow-x-auto rounded-[10px] border-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>BMI</TableHead>
              <TableHead>Fat %</TableHead>
              <TableHead>Muscle %</TableHead>
              <TableHead>Visceral Fat</TableHead>
              <TableHead>Body Age</TableHead>
              <TableHead>Body Comp.</TableHead>
              <TableHead>Ideal Weight</TableHead>
              <TableHead>RM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.createdDate}</TableCell>
                <TableCell>
                  {item.weight} {item.weightUnit}
                </TableCell>
                <TableCell>
                  {item.height} {item.heightUnit}
                </TableCell>
                <TableCell>{item.bmi}</TableCell>
                <TableCell>{item.fat}</TableCell>
                <TableCell>{item.muscle}</TableCell>
                <TableCell>{item.visceral_fat}</TableCell>
                <TableCell>{item.bodyAge}</TableCell>
                <TableCell>{item.body_composition}</TableCell>
                <TableCell>{item.idealWeight || item.ideal_weight}</TableCell>
                <TableCell>{item.rm}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  )
}

function TabsRetail({ retails = [] }) {
  return (
    <TabsContent
      value="retail"
      className="bg-[var(--comp-1)] border rounded-xl p-4"
    >
      <div className="bg-white overflow-x-auto rounded-[10px] border-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Coach Margin</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retails.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.createdAt}</TableCell>
                <TableCell>{item.invoiceNumber}</TableCell>
                <TableCell>{item.orderId}</TableCell>
                <TableCell>
                  {item.clientId?.name} <br />
                  <span className="text-xs text-muted-foreground">
                    {item.clientId?.mobileNumber}
                  </span>
                </TableCell>
                <TableCell>₹{item.costPrice}</TableCell>
                <TableCell>₹{item.sellingPrice}</TableCell>
                <TableCell className="font-medium text-green-600">
                  ₹{item.profit}
                </TableCell>
                <TableCell>{item.coachMargin}%</TableCell>
                <TableCell
                  className={
                    item.status === "Completed"
                      ? "text-green-600 font-medium"
                      : "text-yellow-600 font-medium"
                  }
                >
                  {item.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  )
}