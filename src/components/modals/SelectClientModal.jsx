import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "../FormControl";
import Image from "next/image";
import { Search } from "lucide-react";

export default function SelectClientModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        Select Client
      </DialogTrigger>

      <DialogContent className="!max-w-[700px] border-0 p-0 overflow-auto">
        <DialogHeader className="bg-white py-4 px-6">
          <DialogTitle className="text-black text-lg">
            Select Client
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-6  border-gray-200 rounded-md px-3 py-2 bg-white">
            <Search className="w-3 h-3 text-gray-400" />
            <FormControl
              type="text"
              name="search"
              placeholder="Search Client here"
              className="w-full outline-none text-sm placeholder:text-gray-400 bg-transparent border-none ml-[-2px] p-0"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Symond Write"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">Symond Write</span>
                </div>
                <FormControl
                  type="checkbox"
                  name="symond"
                  value="Symond Write"
                />
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Cavin Peterson"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">Cavin Peterson</span>
                </div>
                <FormControl
                  type="checkbox"
                  name="cavin"
                  value="Cavin Peterson"
                />
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Denial Braine"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">Denial Braine</span>
                </div>
                <FormControl
                  type="checkbox"
                  name="denial"
                  value="Denial Braine"
                />
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="John Deo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">John Deo</span>
                </div>
                <FormControl type="checkbox" name="john" value="John Deo" />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Robert Johnson"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">Robert Johnson</span>
                </div>
                <FormControl
                  type="checkbox"
                  name="robert"
                  value="Robert Johnson"
                />
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Michael Wilson"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">Michael Wilson</span>
                </div>
                <FormControl
                  type="checkbox"
                  name="michael"
                  value="Michael Wilson"
                />
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Charles Childress"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="text-sm">Charles Childress</span>
                </div>
                <FormControl
                  type="checkbox"
                  name="charles"
                  value="Charles Childress"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            className="bg-gray-400 text-white font-semibold w-full px-4 py-2 mt-6 rounded cursor-not-allowed"
            disabled
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
