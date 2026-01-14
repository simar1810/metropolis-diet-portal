import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  addProductToProductModule,
  addRetailReducer,
  init,
  orderCreated,
  orderRequested,
  setCurrentStage,
  setOrderMetaData,
  setProductAmountQuantity
} from "@/config/state-reducers/add-retail";
import { sendData } from "@/lib/api";
import { getProductByBrand } from "@/lib/fetchers/app";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import { Minus, PenLine, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function AddRetailClientModal({ payload }) {
  return <Dialog>
    <DialogTrigger>
      <PenLine className="w-[20px] h-[20px] bg-[var(--accent-1)] text-white p-[3px] rounded-[4px] absolute top-4 right-4 cursor-pointer" />
    </DialogTrigger>
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
  1: "Select Products",
  3: "Shopping Cart",
  4: "Order Completed"
}

function AddRetailContainer() {
  const { stage } = useCurrentStateContext();
  const Component = selectComponent(stage);
  return <div>
    <DialogHeader className="p-4 border-b-1">
      <DialogTitle>{stageTitles[stage]}</DialogTitle>
    </DialogHeader>
    <Component />
  </div>
}

function selectComponent(stage) {
  switch (stage) {
    case 1:
      return Stage2
    case 3:
      return Stage3
    case 4:
      return Stage4
    default:
      return undefined;
  }
}

function Stage2() {
  const { selectedBrandId, dispatch, productModule } = useCurrentStateContext();
  const { isLoading, error, data } = useSWR(`getProductByBrand/${selectedBrandId}`, () => getProductByBrand(selectedBrandId));

  if (isLoading) return <div className="h-[120px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const products = data.data

  return <div>
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => <ProductCard key={product._id} product={product} />)}
    </div>
    {productModule?.length > 0 && <div className="bg-[var(--primary-1)] sticky py-2 bottom-0 border-t-1">
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
  const quantity = productModule?.find(item => item._id === product._id)?.quantity || 0;

  return <div className="bg-[var(--comp-1)] px-4 py-5 md:p-2 flex flex-row md:flex-col gap-5 md:gap-0 rounded-[8px] border-1">
    <Image
      alt=""
      src={product.productImage || "/not-found.png"}
      height={200}
      width={200}
      className="w-1/2 h-2/3 md:w-full md:h-auto object-cover aspect-square rounded-md"
    />
    <div className="flex flex-col items-start justify-start gap-1">
    <p className="font-[500] md:mt-4">{product.productName}</p>
    <p className="text-[12px] text-gray-500 leading-[1.2] mb-2">{product.productDescription.slice(0, 100)}</p>
    {quantity === 0
      ? <Button
        onClick={() => dispatch(addProductToProductModule(product))}
        variant="wz"
        size="sm"
        className="w-2/3 md:w-full md:mt-auto text-[12px]"
      >
        <ShoppingCart className="w-[12px] h-[12px]" />
        Add to Cart
      </Button>
      : <div className="mt-auto flex items-center justify-center gap-4">
        <Button onClick={() => dispatch(setProductAmountQuantity(product._id, quantity + 1))} size="sm" variant="wz_outline">
          <Plus />
        </Button>
        <p className="text-[18px]">{quantity}</p>
        <Button onClick={() => dispatch(setProductAmountQuantity(product._id, quantity - 1))} size="sm" variant="wz_outline">
          <Minus />
        </Button>
        </div>}
      </div>
  </div>
}

function Stage3() {
  const [loading, setLoading] = useState(false)
  const { productModule, coachMargin, customerMargin, margins, dispatch, ...state } = useCurrentStateContext();
  const { _id: clientId } = useAppSelector(state => state.client.data)

  async function createOrder() {
    try {
      setLoading(true);
      const payload = {
        objectId: clientId,
        brand: state.brand,
        productList: productModule,
      }
      const response = await sendData("app/clientRetailRequest", payload);
      if (response.status_code !== 200) throw new Error(response.message || response.error);
      toast.success(response.message);
      dispatch(orderRequested())
    } catch (error) {
      toast.error(error.message);
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
    <Button
      onClick={createOrder}
      variant="wz"
      className="block mx-auto"
      disabled={loading}
    >
      Request Order
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
  const { orderId = "" } = useCurrentStateContext();

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
    {orderId && <p className="text-center text-sm text-gray-500">Order ID {orderId}</p>}
  </div>
}