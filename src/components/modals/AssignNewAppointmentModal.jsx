import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";

export default function AssignNewAppointmentModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        New Appointment
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] min-h-[500px] border-0 p-0 overflow-auto">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold pb-1 w-fit h-[20px]">
            New Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-6 text-sm space-y-6">
          {/* Client Lists */}
          <div className="grid grid-cols-1 gap-6">
            {/* Plan Already Assigned */}
            <div >
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b mb-3">
                  <Image
                    src="/illustrations/image.png"
                    alt="Symond Write"
                    width={40}
                    height={40}
                    className="rounded-full mb-2"
                  />
                  <span className="flex-1">Symond Write</span>
                  <FormControl
                    type="checkbox"
                    checked
                    disabled
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center gap-3 border-b ">
                  <Image
                    src="/illustrations/image.png"
                    alt="Gavin Peterson"
                    width={40}
                    height={40}
                    className="rounded-full mb-2"
                  />
                  <span className="flex-1">Gavin Peterson</span>
                  <FormControl
                    type="checkbox"
                    checked
                    disabled
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex items-center gap-3 border-b">
                  <Image
                    src="/illustrations/image.png"
                    alt="Denial Braine"
                    width={40}
                    height={40}
                    className="rounded-full mb-2"
                  />
                  <span className="flex-1">Denial Braine</span>
                  <FormControl
                    type="checkbox"
                    checked
                    disabled
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b">
                <Image
                  src="/illustrations/image.png"
                  alt="Symond Write"
                  width={40}
                  height={40}
                  className="rounded-full mb-2"
                />
                <span className="flex-1">Symond Write</span>
                <FormControl
                  type="checkbox"
                  name="assign"
                  value="symond"
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center gap-3 border-b">
                <Image
                  src="/illustrations/image.png"
                  alt="Gavin Peterson"
                  width={40}
                  height={40}
                  className="rounded-full mb-2"
                />
                <span className="flex-1">Gavin Peterson</span>
                <FormControl
                  type="checkbox"
                  name="assign"
                  value="gavin"
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center gap-3 border-b">
                <Image
                  src="/illustrations/image.png"
                  alt="Denial Braine"
                  width={40}
                  height={40}
                  className="rounded-full mb-2"
                />
                <span className="flex-1">Denial Braine</span>
                <FormControl
                  type="checkbox"
                  name="assign"
                  value="denial"
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-full px-10 py-3 rounded-md">
              Assign Meal
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
