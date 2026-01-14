import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ShoppingCartModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        <p>cart</p>
      </DialogTrigger>
      <DialogContent className="!max-w-[600px] border-0 p-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            Shopping Cart
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Cart Item 1 */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex gap-4">
              <Image
                src="/illustrations/p.png"
                alt="product"
                width={60}
                height={60}
                className="rounded-md"
              />
              <div>
                <h3 className="text-sm font-semibold">MuscleBlaze Bulk</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Lorem Ipsum odor Selamat
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button className="border px-2 rounded text-sm">−</button>
                  <span className="text-sm">1</span>
                  <button className="border px-2 rounded text-sm">+</button>
                </div>
              </div>
            </div>
            <div className="text-xl font-semibold mt-1">₹ 500</div>
          </div>

          {/* Cart Item 2 */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex gap-4">
              <Image
                src="/illustrations/p.png"
                alt="product"
                width={60}
                height={60}
                className="rounded-md"
              />
              <div>
                <h3 className="text-sm font-semibold">MuscleBlaze Bulk</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Lorem Ipsum odor Selamat
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button className="border px-2 rounded text-sm">−</button>
                  <span className="text-sm">1</span>
                  <button className="border px-2 rounded text-sm">+</button>
                </div>
              </div>
            </div>
            <div className="text-xl font-semibold mt-1">₹ 500</div>
          </div>

          {/* Price Breakdown */}
          <div className="text-sm space-y-1 border-b pb-4 grid gap-2">
            <div className="flex justify-between">
              <span>Cost Price</span>
              <span>1912</span>
            </div>
            <div className="flex justify-between">
              <span>Discount Price</span>
              <span>0</span>
            </div>
            <div className="flex justify-between">
              <span>Profit</span>
              <span>537</span>
            </div>
            <div className="flex justify-between">
              <span>MRP</span>
              <span>2449</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Price</span>
              <span>2449</span>
            </div>
          </div>

          {/* Order Total */}
          <div className="flex justify-between font-semibold text-base">
            <span className="text-2xl">Order Total:</span>
            <span>2449</span>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-4">
            <button className="bg-[var(--accent-1)] text-white px-[120px] py-[12px] rounded-md text-sm">
              Continue
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
