import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  addProductToProductModule, addRetailReducer, changeFieldvalue,
  generateRequestPayload, init, orderCreated, previousStage,
  selectClient, setCurrentStage, setOrderMetaData, setProductAmountQuantity
} from "@/config/state-reducers/add-retail";
import { sendData } from "@/lib/api";
import { getAppClients, getCoachHome, getProductByBrand } from "@/lib/fetchers/app";
import { _throwError, buildUrlWithQueryParams, nameInitials } from "@/lib/formatter";
import { sortByPriority } from "@/lib/retail";
import { copyText } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export default function AddRetailModal({
  open,
  payload,
  setOpen
}) {
  return <Dialog
    open={open}
    onOpenChange={() => setOpen(false)}
  >
    <DialogContent className="max-w-[650px] max-h-[70vh] w-full gap-0 p-0 overflow-y-auto">
      <CurrentStateProvider
        state={init(payload)}
        reducer={addRetailReducer}
      >
        <AddRetailContainer />
      </CurrentStateProvider>
    </DialogContent>
  </Dialog>
}

const stageTitles = {
  1: "Select Client",
  2: "Select Product",
  3: "Shopping Cart",
  4: "Order Completed"
}

function AddRetailContainer() {
  const { stage, dispatch } = useCurrentStateContext();
  const Component = selectComponent(stage);
  return <div>
    <DialogHeader className="p-4 border-b-1">
      <DialogTitle className="flex items-center gap-2">
        {[2, 3].includes(stage) && <ArrowLeft
          className="cursor-pointer"
          onClick={() => dispatch(previousStage())}
        />}
        <p>{stageTitles[stage]}</p>
      </DialogTitle>
    </DialogHeader>
    <Component />
  </div>
}

function selectComponent(stage) {
  switch (stage) {
    case 1:
      return Stage1;
    case 2:
      return Stage2
    case 3:
      return Stage3
    case 4:
      return Stage4
    default:
      return () => <></>;
  }
}

function Stage1() {
  const { isLoading, error, data } = useSWR("app/clients?isActive=true", () => getAppClients({ isActive: true }));
  const { clientId, dispatch, clientName } = useCurrentStateContext();
  const [query, setQuery] = useState("");
  if (isLoading) return <div className="h-[120px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const clients = data.data.filter(client => new RegExp(query, "i").test(client.name));

  return <div className="p-4">
    <FormControl
      type="text"
      name="search"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search Client here"
      className="w-full outline-none text-sm placeholder:text-gray-400 bg-transparent p-0"
    />
    {clientName && <p className="mt-4 text-xs">
      <span className="text-[#808080]">Selected Client</span>
      &nbsp;<>-</>&nbsp;
      <span className="font-bold">{clientName}</span>
    </p>}
    <div className="mt-8 grid grid-cols-2 gap-6">
      {clients.map(client => <SelectClient
        key={client._id}
        client={client}
      />)}
    </div>
    {clientId && <div className="bg-[var(--primary-1)] sticky bottom-0 py-2 border-t-1">
      <Button
        variant="wz"
        className="block mx-auto"
        onClick={() => dispatch(setCurrentStage(2))}
      >
        Continue
      </Button>
    </div>}
  </div>
}

function SelectClient({ client }) {
  const { clientId, dispatch } = useCurrentStateContext();

  return <label className="flex items-center gap-2 border-b pb-2">
    <Avatar>
      <AvatarImage src={client.profilePhoto} />
      <AvatarFallback>{nameInitials(client?.name || "")}</AvatarFallback>
    </Avatar>
    <p className="text-[15px]">{client.name}</p>
    <FormControl
      type="checkbox"
      name="symond"
      value="Symond Write"
      className="ml-auto"
      checked={clientId === client._id}
      onChange={() => dispatch(selectClient(client._id, client.name))}
    />
  </label>
}

function generateMarginsPayload__select(margins) {
  const payload = [];
  let index = 1;
  for (const margin of margins) {
    payload.push({ id: index, name: margin, value: margin });
    index++;
  }
  return payload;
}

function Stage2() {
  const [query, setQuery] = useState("")
  const { isWhitelabel } = useAppSelector(state => state.coach.data) || {}

  const { selectedBrandId, margins, coachMargin, dispatch, productModule } = useCurrentStateContext();
  const { isLoading, error, data } = useSWR(
    `getProductByBrand/${selectedBrandId}`,
    () => getProductByBrand(selectedBrandId)
  );

  const sortedProducts = useMemo(() => data?.data?.length > 0
    ? sortByPriority(data.data || [], isWhitelabel)
    : [], [data?.data?.length])

  if (isLoading) return <div className="h-[120px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const products = sortedProducts
    .filter(item => new RegExp(query, "i").test(item.productName))
  const button = products.map(item => ({ productName: item.productName }))

  return <div>
    <div className="px-4 mt-4">
      <button onClick={() => copyText(JSON.stringify(button))}>button</button>
      <FormControl
        type="text"
        name="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search By Product Name"
        className="w-full outline-none text-sm placeholder:text-gray-400 bg-transparent p-0"
      />
    </div>
    {/* <button onClick={() => navigator.clipboard.writeText(JSON.stringify(button))}>Copy</button> */}
    <div className="mt-2 px-4 flex items-center justify-between">
      <h3>Select Margin</h3>
      <SelectControl
        className="[&_.select]:py-1"
        options={generateMarginsPayload__select(margins)}
        value={coachMargin}
        onChange={e => dispatch(changeFieldvalue("coachMargin", e.target.value))}
      />
    </div>
    <div className="p-4 grid grid-cols-3 gap-4">
      {products.map(product => <ProductCard key={product._id} product={product} />)}
    </div>
    {productModule.length > 0 && <div className="bg-[var(--primary-1)] sticky py-2 bottom-0 border-t-1">
      <Button
        variant="wz"
        className="block mx-auto"
        onClick={() => dispatch(setCurrentStage(3))}
      >
        Continue
      </Button>
    </div>}
  </div>
}

function ProductCard({ product }) {
  const { productModule, dispatch } = useCurrentStateContext();
  const quantity = productModule.find(item => item._id === product._id)?.quantity || 0;

  return <div className="bg-[var(--comp-1)] p-2 flex flex-col rounded-[8px] border-1">
    <Image
      alt=""
      src={product.productImage || "/not-found.png"}
      height={200}
      width={200}
      className="w-full object-cover aspect-square"
    />
    <p className="font-[500] mt-4">{product.productName}</p>
    <p className="text-[12px] text-[var(--dark-1)]/25 leading-[1.2] mb-2">{product.productDescription.slice(0, 100)}</p>
    {quantity === 0
      ? <Button
        onClick={() => dispatch(addProductToProductModule(product))}
        variant="wz"
        size="sm"
        className="w-full mt-auto text-[12px]"
      >
        <ShoppingCart className="w-[12px] h-[12px]" />
        Add to Cart
      </Button>
      : <div className="mt-auto flex items-center justify-center gap-2">
        <Button onClick={() => dispatch(setProductAmountQuantity(product._id, quantity + 1))} size="sm" variant="wz_outline">
          <Plus />
        </Button>
        <Input
          value={quantity}
          type="tel"
          className="p-0 px-1 text-center border-[var(--accent-1)]"
          onChange={e => dispatch(setProductAmountQuantity(product._id, !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : 0))}
        />
        {/* <p className="text-[18px]">{quantity}</p> */}
        <Button onClick={() => dispatch(setProductAmountQuantity(product._id, quantity - 1))} size="sm" variant="wz_outline">
          <Minus />
        </Button>
      </div>}
  </div>
}

function Stage3() {
  const [loading, setLoading] = useState(false)
  const { productModule, coachMargin, customerMargin, margins, dispatch, ...state } = useCurrentStateContext();

  async function createOrder() {
    try {
      setLoading(true);
      const payload = generateRequestPayload({
        ...state,
        productModule,
        coachMargin,
        customerMargin
      })

      const promises = [sendData("app/addClientOrder", payload)]

      if (state.status === "Pending") {
        const endpoint = buildUrlWithQueryParams(
          "app/accept-order",
          { id: state.orderId, status: "Pending" }
        )
        promises.push(sendData(endpoint, {}, "PUT"))
      }
      const response = await Promise.all(promises);
      for (const item of response) {
        if (item.status_code !== 200) throw new Error(item.message)
        toast.message(item.message || "Successfull");
      }
      dispatch(orderCreated(response[0].data))
      mutate("app/coach-retail");
      mutate("app/order-history");
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    if (productModule.length === 0) dispatch(setCurrentStage(2));
  }, [productModule.length]);

  useEffect(function () {
    dispatch(setOrderMetaData(orderMetaData))
  }, [customerMargin])

  const discounts = margins.filter(margin => margin <= coachMargin);
  const costPrice = productModule.reduce((acc, curr) => acc + (Number(curr.productMrpList[coachMargin]) * curr.quantity), 0)
  const salesPrice = productModule.reduce((acc, curr) => acc + (Number(curr.productMrpList[customerMargin]) * curr.quantity), 0)
  const orderMetaData = {
    costPrice,
    mrp: productModule.reduce((acc, curr) => acc + (Number(curr.productMrpList["0"]) * curr.quantity), 0),
    salesPrice,
    profit: salesPrice - costPrice,
  }

  return <div className="px-6 py-4 space-y-4">
    {productModule.map(product => <ProductCardList key={product._id} product={product} />)}
    <div className="text-sm space-y-1 border-b pb-4 grid gap-2">
      <div className="flex justify-between">
        <span>Cost Price</span>
        <span>{orderMetaData.costPrice}</span>
      </div>
      <div className="flex justify-between">
        <span>Discount Price</span>
        <SelectControl
          options={generateMarginsPayload__select(discounts)}
          value={customerMargin}
          onChange={e => dispatch(changeFieldvalue("customerMargin", e.target.value))}
          className="[&_.select]:px-2 [&_.select]:py-1 [&_.select]:border-1"
        />
      </div>
      <div className="flex justify-between">
        <span>Profit</span>
        <span>{orderMetaData.profit}</span>
      </div>
      <div className="flex justify-between">
        <span>MRP</span>
        <span>{orderMetaData.mrp}</span>
      </div>
      <div className="flex justify-between">
        <span>Sales Price</span>
        <span>{orderMetaData.salesPrice}</span>
      </div>
    </div>

    <Button
      onClick={createOrder}
      variant="wz"
      className="block mx-auto"
      disabled={loading}
    >
      Continue
    </Button>
  </div>
}

function ProductCardList({ product }) {
  const { productModule, dispatch, coachMargin } = useCurrentStateContext();
  const quantity = productModule.find(item => item._id === product._id)?.quantity || 0

  return <div className="flex justify-between items-start gap-2 border-b pb-4">
    <div className="flex gap-4">
      <Image
        src={product.productImage || "/not-found.png"}
        alt="product"
        width={60}
        height={60}
        className="w-[100px] h-[100px] rounded-[4px]"
      />
      <div>
        <h3 className="text-sm font-semibold">{product.productName}</h3>
        <p className="text-xs text-gray-500 leading-[1.2] mt-2">{product.productDescription}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="mt-auto flex items-center justify-center gap-4">
            <Button onClick={() => dispatch(setProductAmountQuantity(product._id, quantity + 1))} size="sm" variant="wz_outline">
              <Plus />
            </Button>
            <p className="text-[18px]">{quantity}</p>
            <Button onClick={() => dispatch(setProductAmountQuantity(product._id, quantity - 1))} size="sm" variant="wz_outline">
              <Minus />
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div className="text-xl font-semibold mt-1 whitespace-nowrap">₹ {product.productMrpList[coachMargin] * quantity}</div>
  </div>
}

function Stage4() {
  const { orderId } = useCurrentStateContext();

  return <div className="px-6 py-8">
    <div className="flex justify-center mb-6">
      <Image
        src="/illustrations/confirmed.png"
        alt="Order Success"
        width={450}
        height={450}
        className="w-full max-h-[200px] object-contain"
      />
    </div>

    <h2 className="text-center text-lg font-medium mt-10 mb-1">
      Your Order has been Recorded
    </h2>
    <p className="text-center text-sm text-gray-500">Order ID {orderId}</p>
  </div>
}