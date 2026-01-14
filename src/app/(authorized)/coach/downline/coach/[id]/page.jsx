"use client";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchClubSubscription, retrieveDownlineCoachInformation } from "@/lib/fetchers/app";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials, tabChange } from "@/lib/formatter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useMemo, useRef, useState } from "react";
import Paginate from "@/components/Paginate";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Pen } from "lucide-react";
import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import { SyncedCoachClientDetails } from "@/components/modals/coach/SyncedCoachesModal";
import { useAppSelector } from "@/providers/global/hooks";
import CreateSubscriptionDialog from "@/components/pages/coach/club/club-subscription/CreateClubSubscription";
import SubscriptionsTable from "@/components/pages/coach/club/club-subscription/ListClubSubscriptions";

const tabItems = [
  {
    id: 1,
    title: "Profile",
    value: "profile"
  },
  {
    id: 2,
    title: "Clients",
    value: "clients"
  },
  {
    id: 3,
    title: "Subscriptions",
    value: "subscriptions"
  },
  // {
  //   id: 3,
  //   title: "Retail",
  //   value: "retail"
  // },
  // {
  //   id: 4,
  //   title: "Plans",
  //   value: "plans"
  // }
]

export default function Page() {
  const pathname = usePathname()

  const params = useSearchParams();
  const selectedTab = tabItems.map(item => item.value).includes(params.get("tab"))
    ? params.get("tab")
    : "profile"

  const router = useRouter();

  const { id: coachId } = useParams()
  const { isLoading, error, data } = useSWR(
    `app/downline/${coachId}`,
    () => retrieveDownlineCoachInformation({ coachId })
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error?.message || data.message} />

  const {
    profile = {},
    plans = [],
    retailRequests = [],
    retailOrders = [],
    clients = []
  } = data?.data || {};

  return <div className="content-container content-height-screen">
    <Tabs defaultValue={selectedTab}
      onValueChange={value => tabChange(value, router, params, pathname)}
    >
      <TabsHeader />
      <TabsProfile profile={profile} />
      <TabsClients clients={clients} />
      <TabsContent
        className="bg-[var(--comp-1)] p-4 border-1 rounded-[10px]"
        value="subscriptions"
      >
        <SubscriptionsTab coachId={coachId} />
      </TabsContent>
      <TabsRetail retailOrders={retailOrders} />
      <TabsPlans plans={plans} />
    </Tabs>
  </div>
}

function TabsHeader() {
  const { clubType } = useAppSelector(state => state.coach.data)
  return <TabsList className="bg-transparent flex items-center gap-4 mb-4">
    {tabItems
      .filter(item =>
        [3].includes(item.id)
          ? ["System Leader", "Club Leader"].includes(clubType)
          : true
      )
      .map(tab => <TabsTrigger
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
  return <TabsContent
    value="profile"
    className="bg-[var(--comp-1)] border rounded-xl"
  >
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-1">
            <AvatarImage src={profile.profilePhoto} alt={profile.name} />
            <AvatarFallback>
              {nameInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-1">
            <h2 className="text-lg font-semibold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-sm text-muted-foreground">{profile.mobileNumber}</p>
          </div>
          <UpdateDetails
            actionType="UPDATE_COACH"
            title="Coach Details"
            user={profile}
          />
        </div>

        <UpdateRollno
          rollno={profile.rollno}
          coachId={profile._id}
        />

        {profile.downline?.lineage?.length > 0 && (
          <div>
            <h3 className="text-md font-medium mb-3">Downline Coaches</h3>
            <div className="flex flex-col gap-3">
              {profile.downline.lineage.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition"
                >
                  <Avatar className="w-10 h-10">
                    {member.profilePhoto ? (
                      <AvatarImage
                        src={member.profilePhoto}
                        alt={member.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {member.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{member.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {member.email} • {member.mobileNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </TabsContent>
}

function TabsClients({ clients = [] }) {
  const { clubType } = useAppSelector(state => state.coach.data)
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.clientId?.toLowerCase().includes(search.toLowerCase()) ||
        c.mobileNumber?.toLowerCase().includes(search.toLowerCase())
    )
  }, [clients, search])

  const { page, limit } = pagination
  const totalPages = Math.ceil(filteredClients.length / limit)
  const start = (page - 1) * limit
  const paginatedClients = filteredClients.slice(start, start + limit)

  return (
    <TabsContent
      value="clients"
      className="bg-[var(--comp-1)] p-4 border rounded-xl"
    >
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Search clients by name, ID or mobile..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
          className="max-w-sm bg-white"
        />

        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>City</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.clientId}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client.mobileNumber || "-"}</TableCell>
                  <TableCell>{client.city || "-"}</TableCell>
                  {["Club Leader", "Club Leader Jr"].includes(clubType) && <TableCell onClick={e => e.stopPropagation()}>
                    <SyncedCoachClientDetails
                      client={client}
                      onUpdate={() => location.reload()}
                    >
                      <DialogTrigger>
                        <Eye className="hover:text-[var(--accent-1)] opacity-50 hover:opacity-100" />
                      </DialogTrigger>
                    </SyncedCoachClientDetails>
                  </TableCell>}
                </TableRow>
              ))}
              {paginatedClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Paginate
          page={page}
          limit={limit}
          totalPages={totalPages}
          totalResults={filteredClients.length}
          onChange={({ page, limit }) => setPagination({ page, limit })}
        />
      </div>
    </TabsContent>
  )
}

const getPendingAmount = (sellingPrice, paidAmount) =>
  (Number(sellingPrice) || 0) - (Number(paidAmount) || 0);

function TabsRetail({ retailOrders = [] }) {
  return (
    <TabsContent
      value="retail"
      className="bg-[var(--comp-1)] p-4 border rounded-xl"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Retail Orders</h2>

        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.invoiceNumber}
                  </TableCell>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>
                    {order.clientId?.name} <br />
                    <span className="text-xs text-muted-foreground">
                      {order.clientId?.mobileNumber}
                    </span>
                  </TableCell>
                  <TableCell>₹{order.sellingPrice}</TableCell>
                  <TableCell>₹{order.paidAmount}</TableCell><TableCell
                    className={
                      getPendingAmount(order.sellingPrice - order.paidAmount) > 0
                        ? "text-red-600 font-medium"
                        : "text-green-600"
                    }
                  >
                    ₹{getPendingAmount(order.sellingPrice - order.paidAmount)}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ₹{order.profit}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                </TableRow>
              ))}
              {retailOrders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No retail orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TabsContent>
  )
}

function TabsPlans({ plans = [] }) {
  return (
    <TabsContent
      value="plans"
      className="bg-[var(--comp-1)] p-4 border rounded-xl"
    >
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Plans</h2>

        {plans.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No plans available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan._id} className="shadow-none hover:shadow-md transition">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {plan.name}
                    </CardTitle>
                    <Badge variant="outline">{plan.tag}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {plan.image ? (
                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                      <Image
                        src={plan.image}
                        alt={plan.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full min-h-32 bg-muted flex items-center justify-center rounded-md text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {plan.description || "No description available"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  )
}

export function UpdateDetails({
  actionType,
  title,
  user
}) {
  const { clubType } = useAppSelector(state => state.coach.data)
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState({
    actionType,
    _id: user._id,
    name: user.name || "",
    email: user.email || "",
    mobileNumber: user.mobileNumber || "",
    city: user.city || "",
    rollno: user.rollno || ""
  })

  const closeBtnRef = useRef();

  async function saveCoachDetails() {
    try {
      setLoading(true);
      const response = await sendData("app/downline/coach", payload, "PATCH");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!["Club Leader", "Club Leader Jr"].includes(clubType)) return <></>

  return <Dialog>
    <DialogTrigger className=" self-start">
      <Pen className="w-[14px] h-[14px] mt-2 text-[var(--accent-1)]" />
    </DialogTrigger>
    <DialogContent className="max-w-[100vw] md:max-w-[100px] w-full gap-0 p-0">
      <DialogTitle className="p-4 border-b-1">{title}</DialogTitle>
      <div className="p-4">
        <FormControl
          value={payload.name}
          onChange={e => setPayload(prev => ({ ...prev, name: e.target.value }))}
          label="Name"
          className="block mb-4"
        />
        <FormControl
          value={payload.email}
          onChange={e => setPayload(prev => ({ ...prev, email: e.target.value }))}
          label="Email"
          type="email"
          className="block mb-4"
        />
        <FormControl
          value={payload.mobileNumber}
          onChange={e => setPayload(prev => ({ ...prev, mobileNumber: e.target.value }))}
          label="Mobile Number"
          type="number"
          className="block mb-4"
        />
        <FormControl
          value={payload.city}
          onChange={e => setPayload(prev => ({ ...prev, city: e.target.value }))}
          label="City"
          className="block mb-4"
        />
        <FormControl
          value={payload.rollno}
          onChange={e => setPayload(prev => ({ ...prev, rollno: e.target.value }))}
          label="Roll No."
          placeholder="Enter Roll No."
          className="block mb-4"
        />
        <Button
          variant="wz"
          className="w-xs mx-auto block"
          onClick={saveCoachDetails}
          disabled={loading}
        >Save</Button>
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}

function UpdateRollno({ rollno: defaultRollno, coachId }) {
  const { clubType } = useAppSelector(state => state.coach.data)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rollno, setRollno] = useState(defaultRollno || "")
  const [loading, setLoading] = useState(false)

  async function saveRollno() {
    try {
      setLoading(true)
      const response = await sendData("app/downline/coach/rollno", {
        coachId,
        rollno
      }, "POST")
      if (response.status_code !== 200) throw new Error(response.message)
      toast.success(response.message)
      location.reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!["Club Leader", "Club Leader Jr"].includes(clubType)) return <></>

  return <div className="flex items-center gap-3">
    {isUpdating
      ? <>
        <FormControl
          value={rollno}
          onChange={e => setRollno(e.target.value)}
          className="max-w-sm"
        />
        <Button
          variant="wz"
          className="whitespace-nowrap"
          onClick={saveRollno}
          disabled={loading || !rollno.trim() || defaultRollno === rollno.trim()}
        >Update Roll No</Button>
      </>
      : <>
        <span className="text-sm text-muted-foreground">Roll No: {defaultRollno || "N/A"}</span>
        <Button
          variant="icon"
          className="whitespace-nowrap text-[var(--accent-1)] bg-[var(--comp-1)] border-1 font-bold"
          onClick={() => setIsUpdating(true)}
        >
          {defaultRollno ? "Update" : "Add"}
          <Pen />
        </Button>
      </>}
  </div>
}

function SubscriptionsTab({ coachId }) {
  const { isLoading, error, data, mutate } = useSWR(
    `clubSubscription/${coachId}`,
    () => fetchClubSubscription(coachId)
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <div>
    <CreateSubscriptionDialog
      coachId={coachId}
      onCreated={mutate}
    />
    <ContentError title={error?.message || data.message} />
  </div>

  return <div>
    <div className="flex items-center justify-between">
      <h2>Subscription</h2>
      <CreateSubscriptionDialog
        coachId={coachId}
        onCreated={mutate}
      />
    </div>
    <SubscriptionsTable
      subscriptions={data.data?.history || []}
      onDeleted={mutate}
    />
  </div>
}
