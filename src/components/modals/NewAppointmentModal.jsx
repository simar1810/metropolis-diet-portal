"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import { Search, ChevronDown } from "lucide-react";

export default function NewAppointmentModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-green-500 text-white font-bold px-4 py-2 rounded-full">
        New Appointment
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] border-0 p-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">
            New Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-2 pb-6 space-y-1">
          <h2 className="font-medium">Schedule an Appointment</h2>

          {/* Title */}
          <div className="grid grid-cols-1 gap-1 mt-5 mb-4">
            <p className="text-sm mb-2">Title</p>
            <FormControl
              as="textarea"
              placeholder="Title"
              className="w-full h-12 rounded-lg  border-gray-200 px-4"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 space-y-[-100px]">
            <div>
              <p className="text-sm mb-2">Date</p>
              <div className="relative">
                <FormControl
                  as="textarea"
                  placeholder='Date'
                  className="w-full h-12 rounded-lg  border-gray-200 px-4 appearance-none"
                >
                  {/* <option value="">Date</option> */}
                </FormControl>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div>
              <p className="text-sm mb-2">Time</p>
              <div className="relative">
                <FormControl
                  as="textarea"
                  placeholder='Time'
                  className="w-full h-12 rounded-lg  border-gray-200 px-4 appearance-none"
                >
                  {/* <option value="">Time</option> */}
                </FormControl>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="grid grid-cols-1 gap-1">
            <p className="text-sm mb-2">Agenda</p>
            <FormControl
              as="textarea"
              placeholder="Agenda"
              className="w-full min-h-[120px] rounded-lg  border-gray-200 p-4 resize-none"
            />
          </div>

          {/* Attendee Details */}
          <div>
            <p className="text-sm mb-4">Attendee Details</p>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <FormControl
                  type="radio"
                  name="client-type"
                  value="wellness"
                  defaultChecked
                  className="w-5 h-5  border-green-500 appearance-none rounded-full checked:bg-green-500 checked:border-green-500"
                />
                <span>Metro Polis Client</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <FormControl
                  type="radio"
                  name="client-type"
                  value="other"
                  className="w-5 h-5 border-gray-300 appearance-none rounded-full checked:bg-gray-500 checked:border-gray-500"
                />
                <span>Other Client</span>
              </label>
            </div>
            <div className="relative">
              <Search className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <FormControl
                placeholder="Search Client Here"
                className="w-full h-12 rounded-lg border-gray-200 pl-12 pr-4"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium h-12 rounded-lg transition-colors">
              Request Meeting
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}