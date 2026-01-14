import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import StoryModal from "./StoryModal";
import AddStoryModal from "@/components/modals/app/AddStoryModal";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ClockFading, X } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { sendData } from "@/lib/api";
import Image from "next/image";

export default function Stories({ stories }) {
  const [currentStory, setCurrentStory] = useState(0);
  const [modalOpened, setModalOpened] = useState(false);

  return <div className="bg-[var(--primary-1)] max-h-[80vh] md:max-h-[50vh] mt-2 md:mt-8 p-4 border-1 rounded-[12px] overflow-y-auto">
    <h4 className="mb-4">Results</h4>
    <div className="grid md:grid-cols-4 gap-4 no-scrollbar">
      <AddStoryModal />
      {stories.map((story, index) => <div
        className="relative"
        key={story._id}
      >
        <div
          className="aspect-square bg-[var(--accent-1)] rounded-[10px] p-2 relative border-1 overflow-clip cursor-pointer"
          onClick={() => {
            setModalOpened(true)
            setCurrentStory(index)
          }}
        >
          <div className="hover:[&_.close]:text-[var(--accent-2)]">
            <Image
              alt=""
              src={story.img1 || "/"}
              fill
              className="object-cover object-center"
              onError={e => e.target.src = "/not-found.png"}
            />
          </div>
        </div>
        <DeleteStory id={story._id} />
      </div>)}
      {modalOpened && <StoryModal
        story={stories[currentStory]}
        currentStory={currentStory}
        setCurrentStory={setCurrentStory}
        isLast={stories.length === currentStory + 1}
        onClose={() => setModalOpened(false)}
      />}
    </div>
  </div>
}

function DeleteStory({ id }) {
  async function deleteStory(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(`app/delete-story/${id}`, {}, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("coachHomeTrial");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure to delete this result?"
    action={(setLoading, closeBtnRef) => deleteStory(setLoading, closeBtnRef)}
  >
    <AlertDialogTrigger className="bg-[var(--accent-1)] text-white p-[2px] absolute top-[10px] right-[10px] md:top-[2px] md:right-[2px] z-10 border-1 rounded-full">
      <X className="w-[20px] h-[20px] md:w-[14px] md:h-[14px] close" strokeWidth={3} />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}