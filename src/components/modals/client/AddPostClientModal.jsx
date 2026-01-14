"use client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { RadioGroup } from "../../ui/radio-group";
import { Label } from "../../ui/label";
import { Plus, PlusCircle } from "lucide-react";
import { useRef, useState } from "react";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { getObjectUrl } from "@/lib/utils";
import { canPost, changeNewPostFormData, generateFormData } from "@/config/state-reducers/feed";
import { Textarea } from "../../ui/textarea";
import FormControl from "../../FormControl";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { sendDataWithFormData } from "@/lib/api";

export default function AddPostClientModal() {
  const { dispatch, newPostFormData } = useCurrentStateContext();
  const [loading, setLoading] = useState(false);

  const closeBtnRef = useRef();

  async function addFeed() {
    const toastId = toast.loading("Creating a New Post");
    try {
      setLoading(true);
      const data = generateFormData(newPostFormData, "client");
      const response = await sendDataWithFormData("app/addfeed", data, "POST");
      if (response.status_code !== 200) throw new Error(response.message || "Some error occurred, Please try again Later!");
      toast.success(response.message);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white text-[14px] font-semibold ml-auto px-4 py-2 flex items-center gap-1 rounded-[8px]">
        <Plus className="w-[16px]" />
        New post
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] max-h-[75vh] p-0 overflow-y-auto">
        <DialogHeader className="px-5 !py-4 border-b-1">
          <DialogTitle className="text-black pb-0">Add New Post</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-4">
          <NewPostContentType />

          {newPostFormData.contentType === "img"
            ? <FileInput />
            : <FormControl
              label="Youtube Video Link"
              value={newPostFormData.video}
              onChange={e => dispatch(changeNewPostFormData("video", e.target.value))}
              placeholder="What is the youtube video link"
            />}
          <Label className="font-bold text-[18px] mt-4 mb-1" htmlFor="new-post-caption">Caption</Label>
          <Textarea
            id="new-post-caption"
            placeholder="What should be the caption for this post!"
            value={newPostFormData.caption}
            onChange={e => dispatch(changeNewPostFormData("caption", e.target.value))}
            className="min-h-[150px]"
          />
          <Button
            variant="wz"
            className="w-full text-[18px] mt-8"
            disabled={!canPost(newPostFormData) || loading}
            onClick={addFeed}
          >
            Post
          </Button>
        </div>
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  );
}


function FileInput() {
  const { dispatch, newPostFormData: { file1 } } = useCurrentStateContext();
  const fileRef = useRef();

  return <div className="border rounded-lg flex flex-col items-center justify-center h-40 mb-4 cursor-pointer h-[182px] relative">
    <input
      type="file"
      hidden
      ref={fileRef}
      onChange={e => dispatch(changeNewPostFormData("file1", e.target.files[0]))}
    />
    {file1
      ? <Image
        src={file1 ? getObjectUrl(file1) : "/file.svg"}
        width={50}
        height={50}
        alt="Add Image"
        className="w-full h-full object-contain"
        onClick={() => fileRef.current.click()}
      />
      : <div
        onClick={() => fileRef.current.click()}
        className="w-full h-full flex items-center justify-center"
      >
        <PlusCircle className="w-[40px] h-[40px] text-[var(--dark-2)]" />
      </div>}
  </div>
}

function NewPostContentType() {
  const { dispatch, newPostFormData } = useCurrentStateContext();

  return <RadioGroup
    defaultValue={newPostFormData.contentType}
    className="mb-4 flex items-center gap-8"
  >
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id="new-post-content-image"
        checked={newPostFormData.contentType === "img"}
        onChange={() => dispatch(changeNewPostFormData("contentType", "img"))}
        className="w-[18px] h-[18px]"
      />
      <Label htmlFor="new-post-content-image">Image</Label>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id="new-post-content-vid"
        checked={newPostFormData.contentType === "vid"}
        onChange={() => dispatch(changeNewPostFormData("contentType", "vid"))}
        className="w-[18px] h-[18px]"
      />
      <Label htmlFor="new-post-content-vid">Video</Label>
    </div>
  </RadioGroup>
}