import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import FormControl from "@/components/FormControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { retailPurchaseInitialState } from "@/config/state-data/retail-purchase";
import { addProductToStock, removeProductFromStock, retailPurchaseReducer, setProductQuantity } from "@/config/state-reducers/retail-purchase";
import { sendData } from "@/lib/api";
import { getProductByBrand } from "@/lib/fetchers/app";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";


export default function CreateRetailSaleModal({
  brandId
}) {
  return <CurrentStateProvider
    state={retailPurchaseInitialState}
    reducer={retailPurchaseReducer}
  >
    <Dialog>
      <DialogTrigger className="absolute bottom-2 right-2">
        <Badge
          variant="wz_fill"
          className="font-bold badge opacity-100 md:opacity-0 cursor-pointer px-3 py-1 text-xs md:text-[10px] rounded-full shadow-sm"
        >
          <ShoppingCart />
          Purchase
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-[450px] w-full p-0 gap-0 overflow-clip">
        <DialogTitle className="p-4 border-b-1">Purchase Order</DialogTitle>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <SelectProducts brandId={brandId} />
        </div>
        <CreateOrder />
      </DialogContent>
    </Dialog>
  </CurrentStateProvider>
}

function SelectProducts({ brandId }) {
  const [query, setQuery] = useState("")
  const { ...state } = useCurrentStateContext();
  const { isLoading, error, data } = useSWR(
    `getProductByBrand/${brandId}`,
    () => getProductByBrand(brandId)
  );

  const SelectedProductQuantity = new Map([
    ...state.stocks.map(product => [product.productId, product.quantity])
  ])

  if (isLoading) return <div className="h-[120px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const products = (data.data || [])
    .filter(item => new RegExp(query, "i").test(item.productName))

  return <div>
    <div className="mt-4">
      <FormControl
        type="text"
        name="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search By Product Name"
        className="w-full outline-none text-sm placeholder:text-gray-400 bg-transparent p-0"
      />
    </div>
    <div className="mt-4 grid grid-cols-3 gap-4">
      {products.map(product => <ProductCard
        key={product._id}
        product={product}
        quantity={SelectedProductQuantity.get(product._id) || 0}
      />)}
    </div>
  </div>
}

function ProductCard({ product, quantity }) {
  const { dispatch } = useCurrentStateContext();
  return <div className="bg-[var(--comp-1)] p-2 flex flex-col rounded-[8px] border-1">
    <Image
      alt=""
      src={product.productImage || "/not-found.png"}
      height={200}
      width={200}
      className="w-full object-cover aspect-square"
    />
    <p className="font-[500] mt-4">{product.productName}</p>
    <p className="text-[12px] text-[var(--dark-1)]/25 leading-[1.2] mb-2">{product.productDescription?.slice(0, 100)}</p>
    {quantity === 0
      ? <Button
        onClick={() => dispatch(addProductToStock({ productId: product._id, name: product.productName }))}
        variant="wz"
        size="sm"
        className="w-full mt-auto text-[12px]"
      >
        <ShoppingCart className="w-[12px] h-[12px]" />
        Add to Cart
      </Button>
      : <div className="mt-auto flex items-center justify-center gap-4">
        <Button
          onClick={() => dispatch(setProductQuantity({ productId: product._id, quantity: quantity + 1, name: product.productName }))}
          size="sm" variant="wz_outline">
          <Plus />
        </Button>
        <p className="text-[18px]">{quantity}</p>
        <Button
          onClick={() => quantity >= 2
            ? dispatch(setProductQuantity({ productId: product._id, quantity: quantity - 1, name: product.productName }))
            : dispatch(removeProductFromStock({ productId: product._id }))
          }
          size="sm" variant="wz_outline">
          <Minus />
        </Button>
      </div>}
  </div>
}

function CreateOrder() {
  const { stocks } = useCurrentStateContext();
  const [loading, setLoading] = useState(false);

  const closeRef = useRef(null);

  async function saveOrder() {
    try {
      setLoading(true);
      const response = await sendData("app/inventory", { stocks });
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("app/coach-retail");
      mutate("app/order-history");
      closeRef.current.click()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (stocks.length === 0) return

  return <div className="bg-white sticky-0 bottom-0 py-2 px-4 border-t-1 border-gray-600 flex items-center justify-between gap-2">
    <PurchaseConfirmationModal
      stocks={stocks}
      onConfirm={saveOrder}
      loading={loading}
    />
    <div className="flex items-center gap-2">
      <ShoppingCart className="ml-4" />
      {stocks.length}
    </div>
    <DialogClose ref={closeRef} />
  </div>
}

function PurchaseConfirmationModal({ stocks, onConfirm, loading }) {
  const totalItems = stocks.reduce((acc, stock) => acc + stock.quantity, 0);

  return <Dialog>
    <DialogTrigger asChild>
      <Button
        className="grow"
        variant="wz"
        disabled={loading}
      >
        {loading ? <Loader className="!w-6 border-white" /> : "Review Order"}
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-[500px] w-full p-0 gap-0 overflow-hidden">
      <DialogTitle className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Review Purchase Order</h3>
            <p className="text-sm text-gray-500">Confirm your inventory purchase</p>
          </div>
        </div>
      </DialogTitle>

      <div className="p-6 max-h-[400px] overflow-y-auto">
        <div className="space-y-3">
          {stocks.map((stock, index) => (
            <PurchaseItemCard key={index} item={stock} />
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center text-base font-semibold text-gray-900 mb-1">
            <span>Total Items:</span>
            <span className="text-green-600">{totalItems} items</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Products:</span>
            <span>{stocks.length} different products</span>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1 h-11">
            Cancel
          </Button>
        </DialogClose>
        <Button
          variant="wz"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 h-11"
        >
          {loading ? <Loader className="!w-4 border-white" /> : "Confirm Purchase"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}

function PurchaseItemCard({ item }) {
  // Truncate the product ID to make it more readable
  const shortId = item.productId ? item.productId.substring(0, 8) + "..." : "N/A";
  return <div className="flex items-start gap-3 border-b pb-4 last:border-b-0">
    <Image
      src={item.productImage || "/not-found.png"}
      alt={item.productName || "Product"}
      width={60}
      height={60}
      className="w-[60px] h-[60px] rounded-[6px] object-cover bg-gray-100"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.name}</h4>
          <p className="text-xs text-gray-500 leading-[1.3] mb-2">Product details will be loaded from inventory</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded">ID: {shortId}</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Qty: {item.quantity}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
}