import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import FormControl from "../FormControl";
  
  export default function BrandingModal() {
    return (
      <Dialog>
        <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
          Select Brand
        </DialogTrigger>
  
        <DialogContent className="!max-w-[500px] h-[250px] border-0 p-0 overflow-auto">
          <DialogHeader className="bg-gray-300 py-4 h-[50px]">
            <DialogTitle className="text-black text-sm ml-5">
            Personal Branding
            </DialogTitle>
          </DialogHeader>
            <div className="grid grid-cols-1 gap-4 p-4 overflow-y-hidden">
          <div className="flex gap-4 p-4 overflow-y-hidden mb-15">
           <div className="border border-gray-300 rounded-lg p-4 w-full h-15 flex gap-4 items-center">
            <div className="bg-gray-300 rounded-xl px-3 w-10 h-10"><p></p></div>
            <div className="flex flex-row gap-[200px]">
            <p>Company Name</p>
            <p>✏️</p>
            </div>
           </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  