import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { requestSubscriptionFormControls } from "@/config/data/forms";
import { sendData } from "@/lib/api";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function ReviewSubscriptionModal({ subscription }) {
  const [loading, setLoading] = useState(false);
  const closeBtnRef = useRef(null);

  async function acceptRejectSubscription(status) {
    try {
      setLoading(true);
      const data = {
        vpId: subscription._id,
        status
      }
      const response = await sendData(`approveSubscriptionClients?`, data, "POST");
      if (response.success === false || response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      closeBtnRef.current.click();
      mutate("getRequestSubscription");
      mutate((key) => typeof key === 'string' && key.startsWith('getAllSubscription'));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="w-full h-8 px-4 py-2 text-[14px] has-[>svg]:px-3 bg-[var(--accent-1)] bg-white text-[var(--accent-1)] border-1 border-[var(--accent-1)] font-semibold rounded-[8px]">
      Review
    </DialogTrigger>
    <DialogContent className="!max-w-[500px] max-h-[65vh] text-center border-0 px-0 overflow-auto gap-0">
      <DialogTitle className="text-[24px]">Review Subscription</DialogTitle>
      <div className="text-left mt-8 px-4">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          <FormControl
            label="Client Name"
            type="text"
            placeholder="Enter Name"
            className="w-full block mb-2"
            defaultValue={subscription?.clientId?.name}
            readOnly
          />
          <FormControl
            label="Reuested By Name"
            type="text"
            placeholder="Enter Name"
            className="w-full block mb-2"
            defaultValue={subscription?.addedByName}
            readOnly
          />

          <FormControl
            label="Roll No"
            type="text"
            placeholder="Enter Roll No"
            className="w-full block mb-2"
            defaultValue={subscription?.clientId?.rollno}
            readOnly
          />

          <FormControl
            label="Date Of Shopping"
            type="date"
            placeholder="Enter Date"
            className="w-full block mb-2"
            defaultValue={subscription?.date}
            readOnly
          />

          <FormControl
            label="Subscription Amount"
            type="number"
            placeholder="Enter Amount"
            className="w-full block mb-2"
            defaultValue={subscription?.amount}
            readOnly
          />
        </div>
        {subscription.image && <>
          <h5>Screenshot</h5>
          <Image
            src="/"
            alt=""
            height={400}
            width={400}
            className="w-full max-h-[280px] bg-black mt-2"
          />
        </>}
        <div className="mt-8 flex gap-2">
          <Button onClick={() => acceptRejectSubscription(0)} disabled={loading} className="grow" variant="destructive">Reject</Button>
          <Button onClick={() => acceptRejectSubscription(1)} disabled={loading} className="grow" variant="wz">Approve</Button>
        </div>
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}