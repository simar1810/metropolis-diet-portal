import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormControl from "../FormControl";
export default function AddSelectClientModal() {
  return (
    <Dialog>
        <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
            <p>Select Client</p>
        </DialogTrigger>
      <DialogContent className="!max-w-[800px] border-0 p-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">Select Client</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4">
            <FormControl
              type="text"
              placeholder="Search Client here"
              className="w-full rounded-md px-4 py-2 text-sm "
            />
            <button className="text-green-600 border border-green-400 px-3 py-1 rounded-full text-sm">
              + Add Clients
            </button>
          </div>

          {/* Clients Grid */}
          <div className="text-sm">
            <p className="mb-2 font-semibold">23 Clients Available</p>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                {/* Workout Name 1 */}
                <p className="font-semibold border-b pb-1 mb-2">Workout Name 1</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Symond" width={32} height={32} className="rounded-full" />
                    <span>Symond Write</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Cavin" width={32} height={32} className="rounded-full" />
                    <span>Cavin Peterson</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Denial" width={32} height={32} className="rounded-full" />
                    <span>Denial Braine</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="John" width={32} height={32} className="rounded-full" />
                    <span>John Deo</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>

                {/* No Workouts Assigned */}
                <p className="font-semibold border-b pb-1 mb-2">No Workouts Assigned</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Robert" width={32} height={32} className="rounded-full" />
                    <span>Robert Johnson</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Michael" width={32} height={32} className="rounded-full" />
                    <span>Michael Wilson</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Charles" width={32} height={32} className="rounded-full" />
                    <span>Charles Childress</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <p className="font-semibold border-b pb-1 mb-2">Workout Name 2</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Symond" width={32} height={32} className="rounded-full" />
                    <span>Symond Write</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Cavin" width={32} height={32} className="rounded-full" />
                    <span>Cavin Peterson</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="Denial" width={32} height={32} className="rounded-full" />
                    <span>Denial Braine</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src="/illustrations/image.png" alt="John" width={32} height={32} className="rounded-full" />
                    <span>John Deo</span>
                  </div>
                  <FormControl type="checkbox" />
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-6 text-center">
              <button disabled className="w-[236px] h-[31px] rounded-md shadow-md bg-gray-300 text-white">Continue</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
