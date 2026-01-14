import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RecipieSuccessModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        <p>Recipie</p>
      </DialogTrigger>
      <DialogContent className="!max-w-[405px] min-h-[500px] border-0 p-0 text-center">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            Order Success
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-[100px]">
          {/* Illustration */}
          <div className="flex justify-center mb-6">
            <Image
              src="/svgs/check.svg"
              alt="Order Success"
              width={150}
              height={150}
              className="object-contain "
            />
          </div>

          {/* Text */}
          <h2 className="text-lg text-[var(--accent-1)] mb-1">
            New Recipie Added Succesfullly
          </h2>
          <button className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)] text-white px-[90px] py-2 mt-5 rounded-md">Go Back</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
