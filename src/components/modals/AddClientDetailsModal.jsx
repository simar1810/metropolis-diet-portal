import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";

import FormControl from "../FormControl";
import Image from "next/image";

export default function AddClientDetailsModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        Add Client details
      </DialogTrigger>

      <DialogContent className="!max-w-[656px] h-[600px] border-0 p-0 overflow-auto">
        <DialogHeader className="bg-gray-300 py-6 h-[56px]">
          <DialogTitle className="text-black text-sm ml-5">
            Add Client
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          <p className="text-sm font-semibold mb-1">Lets add a New Client</p>
          <p className="text-xs text-gray-500 mb-6">
            But before that, we will need some details about them. Select when
            your customer joined you, New (now or Recently) and Existing (old)
          </p>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <p className="font-semibold text-sm">Select Customer type</p>
              <label className="flex items-center gap-2">
                <input type="radio" name="type" value="New" />
                New
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="type" value="Existing" />
                Existing
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormControl
              label="Client Name"
              type="text"
              placeholder="Enter Name"
            />

            <div className="relative">
              <FormControl
                label="DOB (mandatory or 01/01/2000)"
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-full"
              />
              <CalendarIcon className="absolute right-3 top-10 w-4 h-4 text-gray-500" />
            </div>
            <div>
              <span className="label font-[600] block mb-1">Gender</span>
              <div className="flex gap-4">
                <button className="flex-1 p-2 border rounded text-sm">
                  ♂ Male
                </button>
                <button className="flex-1 p-2 border rounded text-sm">
                  ♀ Female
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <FormControl
                label="Date of Joining"
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-full"
              />
              <CalendarIcon className="absolute right-3 top-10 w-4 h-4 text-gray-500" />
            </div>

            <div>
              <span className="label font-[600] block mb-1">Height</span>
              <div className="flex items-center gap-4 text-sm mb-2">
                <label className="flex items-center gap-1">
                  <input type="radio" />
                  Ft In
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" />
                  cm
                </label>
              </div>

              <div className="flex gap-2">
                <FormControl type="text" placeholder="Ft" className="w-full" />
                <FormControl type="text" placeholder="In" className="w-full" />
              </div>
            </div>
            <div>
              <span className="label font-[600] block mb-2">Weight</span>
              <div className="flex gap-3 text-sm mb-2">
                <label className="flex items-center gap-1">
                  <input type="radio" />
                  Kg
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" />
                  Lbs
                </label>
              </div>
              <FormControl type="text" placeholder="Enter weight" />
            </div>
            <div className="mr-[-10px]">
              <FormControl
                label="Visceral Fat (optional)"
                type="text"
                placeholder="Enter Visceral Fat"
              />
            </div>
            <div className="col-span-2">
              <span className="label font-[600] block mb-2">
                Body Composition
              </span>
              <div className="flex gap-2">
                {/* Slim */}
                <div className="border rounded p-3 text-center cursor-pointer w-24">
                  <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/svgs/slim.svg"
                      width={60}
                      height={60}
                      alt="Slim SVG"
                    />
                  </div>
                  <p className="text-xs">Slim</p>
                </div>

                {/* Medium */}
                <div className="border rounded p-3 text-center cursor-pointer w-24">
                  <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/svgs/medium.svg"
                      width={50}
                      height={60}
                      alt="Medium SVG"
                    />
                  </div>
                  <p className="text-xs">Medium</p>
                </div>

                {/* Fat */}
                <div className="border rounded p-3 text-center cursor-pointer w-24">
                  <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/svgs/fat.svg"
                      width={150}
                      height={150}
                      alt="Fat SVG"
                    />
                  </div>
                  <p className="text-xs">Fat</p>
                </div>
              </div>
            </div>
          </div>

          <button className="bg-[var(--accent-1)] text-white font-bold w-[50%] items-center text-center ml-[150px] px-4 py-3 rounded-[4px] mt-6">
            Next
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
