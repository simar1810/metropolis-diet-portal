import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";
import { Label } from "@radix-ui/react-label";
import { PenLine, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function UpdateNoteModal({
  title,
  description,
  _id,
  person = "coach"
}) {
  const [loading, setLoading] = useState(false);
  const closeBtnRef = useRef();

  async function addNote(e) {
    try {
      setLoading(true);
      e.preventDefault();
      const data = {
        title: e.currentTarget.title.value,
        description: e.currentTarget.description.value,
      }
      for (const field of ["title", "description"]) {
        if (!data[field]) throw new Error(`${field} is required!`);
      }
      const response = await sendData(`app/notes?person=${person}&id=${_id}`, data, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message || "Note added successfully!");
      closeBtnRef.current.click();
      mutate("app/getNotes");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger>
      <PenLine className="w-[20px] h-[20px] bg-white p-1 rounded-[4px]" />
    </DialogTrigger>
    <DialogContent className="p-0">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle>New Note</DialogTitle>
      </DialogHeader>
      <form onSubmit={addNote} className="px-4 pb-4">
        <FormControl
          label="Title"
          name="title"
          defaultValue={title}
          placeholder="Enter title.."
        />
        <Label htmlFor="note-description" className="font-bold block mt-4 mb-2">Description</Label>
        <Textarea
          id="note-description"
          name="description"
          defaultValue={description}
          placeholder="Enter description here.."
          className="min-h-[100px]"
        />
        <Button
          disabled={loading}
          className="w-full mt-20"
          variant="wz"
        >
          Update Note
        </Button>
      </form>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}