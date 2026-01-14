import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";

export default function ProfileModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        Profile
      </DialogTrigger>
      <DialogContent className="!max-w-[656px] h-[692px] border-0 p-0 overflow-clip">
        <DialogHeader className="bg-gray-300 py-6 h-[56px] ">
          <DialogTitle className="text-left ml-10 text-black text-lg font-semibold">
            Add Client
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pb-[190px] flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center mb-4 mr-[500px]">
            <img
              src="/placeholder-user.png"
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-[var(--accent-1)] p-1 rounded-full cursor-pointer">
              <Camera size={16} color="white" />
              <input type="file" className="hidden" />
            </label>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full">
              <p className="text-[10px] font-semibold">
                Mobile Number(optional)
              </p>
              <input
                type="text"
                placeholder="Mobile Number"
                className="flex-1 border rounded p-2 text-sm w-full"
              />
            </div>
            <div className="w-full">
              <p className="text-[10px] font-semibold"> Email(optional)</p>
              <input
                type="email"
                placeholder="Email ID"
                className="flex-1 border rounded p-2 text-sm w-full"
              />
            </div>
          </div>

          <div className="w-full mt-5">
            <p className="w-full font-semibold text-[10px]">
              Notes for Client(Optional)
            </p>
            <textarea
              placeholder="Add Notes for this Client"
              className="w-full border rounded p-2 text-sm min-h-[100px] mb-4"
            />
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <p className="text-[12px]">
                Remind yourself when you are meeting this client next time
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" value="8 Day" />8 Day
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" value="Custom" />
                  Custom
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[12px]">
                Select if client is your lead (Inactive) or Customer (Active)
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" value="Active" />
                  Active
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" value="Inactive" />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          <button className="bg-[var(--accent-1)] hover:bg-[var(--accent-1)] text-white font-bold w-[236px] py-3 rounded mt-2">
            Next
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
