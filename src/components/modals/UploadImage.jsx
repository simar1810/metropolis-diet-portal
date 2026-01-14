import { uploadImage } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { getObjectUrl } from "@/lib/utils";

export default function UploadImage({ setter }) {
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState();

  const closeRef = useRef();

  const fileRef = useRef();

  async function handler() {
    try {
      setLoading(true);
      const response = await uploadImage(image);
      toast.success("Image Uploaded successfully!");
      setter(response.img);
      closeRef.current.click();
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(true)
    }
  }

  return <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">
        <ImageIcon />
        Upload Image
      </Button>
    </DialogTrigger>
    <DialogContent className="p-0 gap-0">
      <DialogTitle className="p-4 border-b-1">Upload Image</DialogTitle>
      <div className="p-4">
        <div className="relative">
          <Image
            src={Boolean(image) ? getObjectUrl(image) : "/not-found.png"}
            height={400}
            width={400}
            className="w-full max-h-[250px] object-contain"
            alt=""
            onClick={() => fileRef.current.click()}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={e => setImage(e.target.files[0])}
          />
          {image && <X
            className="absolute top-[-10px] right-[-10px] cursor-pointer"
            onClick={() => setImage()}
          />}
        </div>
        <Button
          className="w-full mt-8"
          variant="wz"
          onClick={handler}
          disabled={loading}
        >
          Save
        </Button>
        <DialogClose ref={closeRef} />
      </div>
    </DialogContent>
  </Dialog>
}