import { MoreVertical, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function ProgramModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        Programs
      </DialogTrigger>
      <DialogContent className="!max-w-[656px] h-[692px] border-0 p-0 overflow-clip">
        <DialogHeader className="bg-gray-100 py-6 h-[56px] ">
          <DialogTitle className="text-left ml-10 text-black text-lg font-semibold">
            Programs
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium">Your Programs</h3>
            <button className="bg-[var(--accent-1)] hover:bg-green-600 transition-colors text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {/* Program Card 1 */}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/illustrations/run.png"
                alt="Runner in green jacket"
                className="w-full h-[160px] object-cover"
                width={400}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-semibold">Program Name 1</h3>
              </div>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem className="gap-2">
                      <Pencil size={16} />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600">
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Program Card 2 */}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/illustrations/run.png"
                alt="Runner in green jacket"
                width={400}
                height={400}
                className="w-full h-[160px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-white font-semibold">Program Name 2</h3>
              </div>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem className="gap-2">
                      <Pencil size={16} />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600">
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
