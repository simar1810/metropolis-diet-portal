import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { sendData } from "@/lib/api";
import { addDays, format, parse } from "date-fns";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function AddSubscriptionModal({ _id, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    endDate: "",
    invoice: "",
    paymentMode: "cash",
    startDate: "",
    description: "",
    noOfDays: 30
  });
  const closeBtnRef = useRef(null);

  async function addSubscription() {
    try {
      setLoading(true);
      const response = await sendData(`addSubscription/${_id}`, formData, "POST");
      if (!response.status) throw new Error(response.message);
      toast.success(response.message);
      mutate(`getClientSubscriptions/${_id}`)
      if (onSubmit) onSubmit()
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="font-semibold text-[12px] text-[var(--primary-1)] bg-[var(--accent-1)] px-4 py-2 rounded-[8px]">
      Add Membership
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] max-h-[70vh] border-0 px-0 overflow-auto gap-0 overflow-y-auto">
      <DialogTitle className="text-[24px] px-4">Add Membership</DialogTitle>
      <div className="mt-6 px-4">
        <FormControl
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          label="Amount"
          type="number"
          placeholder="Enter Amount"
          className="block mb-4"
        />
        <FormControl
          value={formData.startDate}
          onChange={(e) => setFormData({
            ...formData,
            startDate: e.target.value,
            endDate: format(
              addDays(
                parse(e.target.value, "yyyy-MM-dd", new Date()),
                formData.noOfDays
              ),
              "yyyy-MM-dd"
            )
          })}
          label="Start Date"
          type="date"
          className="block mb-4"
        />
        <FormControl
          value={formData.noOfDays}
          onChange={e => setFormData({
            ...formData,
            noOfDays: parseInt(e.target.value),
            endDate: format(
              addDays(
                parse(formData.startDate, "yyyy-MM-dd", new Date()),
                parseInt(e.target.value)
              ),
              "yyyy-MM-dd"
            )
          })}
          label="No Of Membership Dates"
          type="number"
          min={0}
          className="block mb-4"
        />
        <FormControl
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          label="End Date"
          type="date"
          className="block mb-4"
        />
        <FormControl
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          label="Description"
          type="text"
          placeholder="Enter Description"
          className="block mb-4"
        />
        <SelectControl
          value={formData.paymentMode}
          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
          label="Payment Mode"
          className="block mb-4"
          options={[{ id: 1, name: "Cash", value: "cash" }, { id: 2, name: "UPI", value: "upi" }, { id: 3, name: "Net Banking", value: "online" }]}
        />
        <Button
          variant="wz"
          disabled={loading}
          onClick={addSubscription}
          className="mt-8"
        >
          Save
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}