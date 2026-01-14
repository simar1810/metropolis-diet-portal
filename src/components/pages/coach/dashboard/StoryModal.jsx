import Modal from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const STORY_TIMER = 60;

export default function StoryModal({
  story,
  currentStory,
  setCurrentStory,
  isLast,
  onClose
}) {
  const [seconds, setSeconds] = useState(0);

  function nextStory() {
    if (isLast) {
      onClose()
    } else {
      setSeconds(0);
      setCurrentStory(prev => prev + 1);
    }
  }

  function prevStory() {
    if (currentStory === 0) {
      onClose()
    } else {
      setSeconds(0);
      setCurrentStory(prev => prev - 1);
    }
  }

  useEffect(function () {
    const interval = setTimeout(function () {
      if (seconds === STORY_TIMER && isLast) {
        onClose();
      } else if (seconds === STORY_TIMER) {
        setSeconds(0);
        setCurrentStory(prev => prev + 1)
      } else {
        setSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return <Modal
    className="flex items-center justify-center"
    onClose={onClose}
  >
    <ChevronLeft
      onClick={prevStory}
      className="w-[64px] h-[64px] text-[var(--comp-2)]/25 hover:text-white cursor-pointer"
    />
    <div className="max-w-[400px] w-full bg-[var(--accent-1)] p-4 rounded-md aspect-[9/12] relative overflow-clip">
      <Image
        fill
        alt=""
        src={story.img1}
        className="object-contain"
        draggable={false}
      />
      <Progress
        value={seconds / STORY_TIMER * 100}
        className="rounded-none !h-[2px] absolute left-0 bottom-0 [&_.progress-bar]:bg-[var(--accent-2)]/90 [&_.progress-bar]:duration-[1s] ease-linear"
      />
    </div>
    <ChevronRight
      onClick={nextStory}
      className="w-[64px] h-[64px] text-[var(--comp-2)]/25 hover:text-white cursor-pointer"
    />
  </Modal>
}