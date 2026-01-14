"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { clientOrderHistory, getBrands } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import useSWR from "swr";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { parse } from "date-fns";
import { RetailCompletedLabel, RetailPendingLabel } from "@/app/(authorized)/coach/retail/page";
import AddRetailClientModal from "@/components/modals/client/AddRetailClientModal";

export default function Page() {
  const { organisation } = useAppSelector(state => state.client.data)
  if (organisation !== "Herbalife") return <ContentError title="You are not allowed to access this page" />
  return <Container />
}

function Container() {
  const { _id: clientId } = useAppSelector(state => state.client.data)
  const { isLoading, error, data } = useSWR("app/order-history", () => clientOrderHistory(clientId));
  if (isLoading) return <ContentLoader />
  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  return <div className="content-container content-height-screen">
    <RetailContainer orders={data?.data || []} />
  </div>
}

function RetailContainer({ orders }) {
  return <Tabs defaultValue="brands">
    <TabsList className="w-full bg-transparent p-0 mb-4 flex justify-start gap-4 border-b-2 rounded-none">
      <TabsTrigger
        className="pb-4 px-4 font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
        value="brands"
      >
        New Order
      </TabsTrigger>
      <TabsTrigger
        className="pb-4 px-4 font-semibold rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-1)] data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:border-b-[var(--accent-1)]"
        value="order-history"
      >
        Order History
      </TabsTrigger>
    </TabsList>
    <Brands />
    <OrderHistory orders={orders || []} />
  </Tabs>
}

function Brands() {
  const { isLoading, error, data } = useSWR("app/get-brands", getBrands);

  if (isLoading) return <TabsContent value="brands">
    <ContentLoader />
  </TabsContent>

  if (error || data.status_code !== 200) return <TabsContent value="brands">
    <ContentError title={error || data.message} />
  </TabsContent>

  const brands = data.data;

  if (brands.length === 0) return <TabsContent value="brands">
    <ContentError title="0 Brands found!" className="mt-0 font-bold" />
  </TabsContent>

  return <TabsContent value="brands">
    <div className="flex items-center gap-2 justify-between">
      <h4>Brands</h4>
    </div>
    <div className="mt-4 grid grid-cols-1 md:grid-cols-6">
      {brands.map(brand => <Brand key={brand._id} brand={brand} />)}
    </div>
  </TabsContent>
}

function Brand({ brand }) {
  return <Card className="p-0 shadow-none border-0 gap-2 relative">
    <Image
      src={brand.image || "/not-found.png"}
      alt=""
      height={540}
      width={540}
      className="object-cover shadow-md shadow-[#808080]/80"
    />
    <p className="px-1">{brand.name}</p>
    <div className="absolute top-0 right-0">
      <AddRetailClientModal
        payload={{
          margin: 0,
          selectedBrandId: brand._id,
          margins: brand.margins
        }}
      />
    </div>
  </Card>
}

function OrderHistory({ orders }) {
  const myOrders = [...orders.mappedRetailRequests, ...orders.orderHistory]
    .sort((a, b) => {
      const dateA = parse(a.createdAt, 'dd-MM-yyyy', new Date());
      const dateB = parse(b.createdAt, 'dd-MM-yyyy', new Date());
      return dateB - dateA;
    })
    .sort((a, b) => a.status === "Completed");

  if (myOrders.length === 0) return <TabsContent value="order-history">
    <ContentError title="0 Orders Placed!" className="mt-0 font-bold" />
  </TabsContent>

  return <TabsContent value="order-history">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {myOrders.map(order => <Order key={order._id} order={order} />)}
    </div>
  </TabsContent>
}

function Order({ order }) {
  return <Card className="bg-[var(--comp-1)] mb-2 gap-2 border-1 shadow-none px-4 py-2 rounded-[4px]">
    <CardHeader className="px-0">
      {order.status === "Completed"
        ? <RetailCompletedLabel status={order.status} />
        : <RetailPendingLabel status={order.status} />}
    </CardHeader>
    <CardContent className="px-0">
      <div className="flex gap-4">
        <Image
          height={100}
          width={100}
          unoptimized
          src={order.productModule?.at(0)?.productImage}
          alt=""
          className="bg-black w-[64px] h-[64px] object-cover rounded-md"
        />
        <div>
          <h4 className="text-xs md:text-base">{order.productModule.map(product => product.productName).join(", ")}</h4>
          <p className="text-[12px] md:text-[10px] text-[var(--dark-1)]/25 leading-[1.2]">{order.productModule?.at(0)?.productDescription}</p>
          {order.sellingPrice && <div className="text-[20px] text-nowrap font-bold ml-auto">₹ {order.sellingPrice}</div>}
        </div>
      </div>
    </CardContent>
    <CardFooter className="px-0 items-end justify-between">
      <div className="text-[12px]">
        <p className="text-[var(--dark-1)]/25">Order From: <span className="text-[var(--dark-1)]">{order?.clientId?.name || "-"}</span></p>
        <p className="text-[var(--dark-1)]/25">Order Date: <span className="text-[var(--dark-1)]">{order.createdAt || "-"}</span></p>
      </div>
    </CardFooter>
  </Card>
}