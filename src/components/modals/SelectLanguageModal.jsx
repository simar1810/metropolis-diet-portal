import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "../FormControl";

export default function SelectLanguageModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        Select Language
      </DialogTrigger>

      <DialogContent className="!max-w-[500px] h-[250px] border-0 p-0 overflow-auto">
        <DialogHeader className="bg-gray-300 py-4 h-[50px]">
          <DialogTitle className="text-black text-sm ml-5">
          Language Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 p-4 overflow-y-hidden">
          <div className="mb-[500px] ">
            <FormControl
              type="radio"
              name="Language"
              value="English"
              label="English"
            />
            <FormControl
              type="radio"
              name="Language"
              value="Hindi"
              label="Hindi"
            />
            <FormControl
              type="radio"
              name="Language"
              value="Punjabi"
              label="Punjabi"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
