import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sendDataWithFormData } from "@/lib/api";
import { Image, Trophy } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import NextImage from "next/image"
import { getObjectUrl } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";

export default function UpdateCoachAwardModal() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({ file: null, title: "" }));

  const _id = useAppSelector(state => state.coach.data._id);

  const closeBtnRef = useRef(null);
  const fileRef = useRef(null);

  async function updateCoachAward(e) {
    try {
      e.preventDefault();
      setLoading(true);
      const data = new FormData(e.target);
      data.append("coachId", _id);
      const response = await sendDataWithFormData(`app/updateCoachProfile`, data, "POST");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("coachProfile");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="bg-[var(--accent-1)] text-white text-[14px] font-semibold px-5 py-2 flex items-center gap-2 rounded-[8px]">
      <Trophy />
      Add Award
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] text-center border-0 px-4 overflow-auto gap-0">
      <DialogTitle className="text-[24px] mb-4">New Award</DialogTitle>
      <form onSubmit={updateCoachAward}>
        <Input
          type="file"
          name="file"
          ref={fileRef}
          className="hidden"
          onChange={e => setFormData(prev => ({ file: e.target.files[0], title: prev.title }))}
        />
        <div onClick={() => fileRef.current.click()} className="h-[150px] flex items-center justify-center border-1 rounded-[8px] cursor-pointer relative">
          {!formData.file
            ? <Image className="text-[var(--dark-1)]/25" />
            : <NextImage
              src={getObjectUrl(formData.file)}
              fill
              alt=""
              className="object-contain"
            />}
        </div>
        <Input
          placeholder="Title"
          className="mt-4"
          value={formData.title}
          name="awardTitle"
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
        <Button
          variant="wz"
          disabled={loading}
          className="mt-20"
        >
          Add Award
        </Button>
      </form>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}