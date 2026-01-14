import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sendDataWithFormData } from "@/lib/api";
import { getObjectUrl } from "@/lib/utils";
import { Plus, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function AddStoryModal() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();

  const closeBtnRef = useRef(null);
  const fileRef = useRef(null);

  async function updateClientGoal() {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("file", image);
      const response = await sendDataWithFormData(`app/addStory`, data, "POST");
      if (response.status_code !== 200) throw new Error(response.message);
      mutate("coachHomeTrial")
      toast.success(response.message);
      setImage();
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger>
      <div className="aspect-square bg-[var(--accent-1)] rounded-[10px] p-2 h-40 md:h-auto w-full">
        <div className="w-[100px] h-[100px] md:w-[64px] md:h-[64px] border-2 bg-[var(--primary-1)] border-[var(--primary-1)] relative rounded-full">
          <Avatar className="w-full h-full p-3">
            <AvatarImage src="/logo.png" />
          </Avatar>
          <Plus className="w-[18px] h-[18px] bg-black text-white absolute bottom-0 right-0 rounded-full" />
        </div>
      </div>
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] text-center border-0 p-0 overflow-auto gap-0">
      <DialogHeader className="px-4 py-3 border-b-1">
        <DialogTitle className="text-[24px] p-0">Add Result</DialogTitle>
      </DialogHeader>
      <div className="px-4 py-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          onChange={e => setImage(e.target.files[0])}
        />
        {image
          ? <div className="relative">
            <Image
              src={getObjectUrl(image)}
              alt=""
              height={500}
              width={500}
              className="w-full max-h-64 h-full object-contain"
            />
            <X
              className="w-[16px] h-[16px] absolute top-2 right-2 cursor-pointer"
              onClick={() => setImage()}
            />
          </div>
          : <div
            onClick={() => fileRef.current.click()}
            className="h-64 flex items-center justify-center border-2 bg-zinc-100 border-dashed rounded-[8px]"
          >
            <ImageIcon className="w-[20px] h-[20px]" />
          </div>}
        <Button
          variant="wz"
          onClick={updateClientGoal}
          disabled={loading}
          className="mt-24"
        >
          Submit
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}