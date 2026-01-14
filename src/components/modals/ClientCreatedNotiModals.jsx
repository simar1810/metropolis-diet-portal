import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import Image from "next/image";
export default function ClientCreatedNotiModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        client created notify
      </DialogTrigger>
      <DialogContent className="!max-w-[656px] h-[692px] border-0 p-0 overflow-clip">
        <DialogHeader className="bg-gray-300 py-6 h-[56px] ">
          <DialogTitle className="text-left ml-5 text-black">
            Add Client
          </DialogTitle>
        </DialogHeader>
        <div className="p-2 pt-0">
          <Check className="text-[var(--accent-1)] w-[176px] h-[173px] mx-auto" />
          <h2 className="!font-semibold text-[var(--accent-1)] text-lg text-center">
            Client Added Successfully
          </h2>
          <p className="text-[14px] text-center mt-10 text-gray-400 font-semibold">
            Your Client Account has been created
            <br /> with Client ID #123456
          </p>
        </div>
        <div className="flex flex-col gap-0 mb-[100px]">
          <label className="text-sm font-semibold ml-[40px] ml-[190px]">
            Client Link
          </label>
          <div className="flex items-center border w-[309px] h-[45px] border-gray-300 rounded-lg mx-auto ">
            <input
              type="text"
              value="www.wellnessZ.com/Client12345"
              readOnly
              className=" text-gray-500 text-sm flex-1 outline-none"
            />
            <button className="bg-[var(--accent-1)] rounded-md text-white px-4 py-[16px] text-sm font-medium hover:bg-[var(--accent-1)] transition">
              Copy
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
