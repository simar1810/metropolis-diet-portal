"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";

export default function NewNotesModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-primary text-white font-bold px-4 py-2 rounded-full">
        New Notes
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] border-0 p-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            New Notes
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-6 space-y-6">
          {/* Title */}
          <div>
            <p className="text-sm mb-2">Title</p>
            <FormControl
              placeholder="Enter Title"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-sm mb-2">Description</p>
            <FormControl
              as="textarea"
              placeholder="Enter description here"
              className="w-full min-h-[200px]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button className="w-full bg-gray-200 shadow-md outline-none text-gray-700 font-medium py-3 rounded-md">
              Add Note
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}