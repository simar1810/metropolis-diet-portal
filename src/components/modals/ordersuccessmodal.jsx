import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrderSuccessModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        <p>Order Success</p>
      </DialogTrigger>
      <DialogContent className="!max-w-[600px] border-0 p-0 text-center">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            Order Success
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-8">
          {/* Illustration */}
          <div className="flex justify-center mb-6">
            <Image
              src="/illustrations/confirmed.png"
              alt="Order Success"
              width={250}
              height={250}
              className="object-contain"
            />
          </div>

          {/* Text */}
          <h2 className="text-lg font-medium mb-1">
            Your Order has been Recorded
          </h2>
          <p className="text-sm text-gray-500">Order ID #1234-1234-1234</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
