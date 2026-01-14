import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { sendData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";
import { Plus, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function AddNewServing({ clientId, date }) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    clientId,
    status: "present",
    servingNumber: "",
    date: date
  })

  const closeBtnRef = useRef();

  async function addServing() {
    try {
      setLoading(true);
      if (!payload.status) _throwError("Status is required");
      if (!payload.servingNumber) _throwError("Serving number is required");

      const response = await sendData(
        "app/physical-club/attendance?person=coach",
        payload,
        "PUT"
      );
      if (response.status_code !== 200) _throwError(response.message);
      toast.success(response.message || "Successfully changed the attendance status");
      mutate("app/physical-club/attendance");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }


  return <Dialog>
    <DialogTrigger asChild>
      <Button
        size="sm"
        variant=""
        className="h-auto text-xs font-bold py-1 ml-auto mt-4 flex"
      >
        <PlusIcon className="w-4 h-4" />
        Add New Serving
      </Button>
    </DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1 font-semibold">Add New Serving</DialogTitle>
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Label className="mr-auto font-bold">Status</Label>
          <Select
            value={payload.status}
            onValueChange={(value) => setPayload({ ...payload, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* serving number input */}
        <div className="my-2">
          <Label className="mr-auto font-bold mb-2">Serving Number</Label>
          <Input
            type="number"
            placeholder="Enter Serving Number"
            value={payload.servingNumber}
            onChange={(e) => setPayload({ ...payload, servingNumber: Number(e.target.value) })}
          />
        </div>

        <Button
          className="w-full mt-4"
          variant="wz"
          min={1}
          disabled={loading}
          onClick={addServing}
        >
          <Plus />
          Add
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}