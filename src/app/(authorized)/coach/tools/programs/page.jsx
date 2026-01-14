"use client"
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import EditProgramModal from "@/components/modals/tools/EditProgramModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { sendData } from "@/lib/api";
import { getClientPrograms } from "@/lib/fetchers/app";
import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { CSS } from '@dnd-kit/utilities';

export default function Page() {
  const [isBeingShuffled, setIsBeingShuffled] = useState(false);
  const { isLoading, error, data } = useSWR("client/programs", getClientPrograms);
  if (isLoading) return <ContentLoader />
  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const programs = data.data;
  return <div className="content-container content-height-screen">
    <div className="mb-10 flex items-center justify-between gap-2">
      <h2>Programs</h2>
      <Link href="/coach/tools/programs/add" className="bg-green-700 text-white px-4 py-2 ml-auto rounded-[10px] font-bold">Add</Link>
      {!isBeingShuffled
        ? <Button onClick={() => setIsBeingShuffled(true)} className="font-bold">Shuffle</Button>
        : <Button onClick={() => setIsBeingShuffled(false)} variant="secondary" className="font-bold ">Cancel</Button>}
    </div>
    {isBeingShuffled
      ? <ShufflePrograms
        programs={programs}
        setIsBeingShuffled={setIsBeingShuffled}
      />
      : <ProgramList programs={programs} />}
  </div>
}

function ProgramList({ programs }) {
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {programs.map((program, index) => <div
      key={index}
      className="bg-[var(--comp-1)] rounded-[10px] border-1 overflow-clip hover:[&_.actions]:opacity-100"
    >
      <div className="relative">
        <div className="bg-white px-2 py-1 rounded-[10px] border-1 actions absolute bottom-2 right-2 opacity-0 flex items-center gap-1">
          <EditProgramModal program={{ ...program, order: index }} />
          <DeleteProgramAction id={program._id} />
        </div>
        <Image
          src={program.image || "/not-found.png"}
          onError={e => e.target.src = "/not-found.png"}
          alt=""
          height={400}
          width={400}
          className="h-auto aspect-video object-cover"
        />
      </div>
      <div className="p-4">
        <h2>{program.name}</h2>
        <Link href={program.link || "/"} target="_blank" className="text-green-700 text-[14px] hover:text-underline font-bold">Open Link</Link>
      </div>
    </div>)}
  </div>
}

function ShufflePrograms({ programs, setIsBeingShuffled }) {
  const [programOrder, setProgramOrder] = useState(programs.map(p => p._id));
  const [loading, setLoading] = useState(false);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = programOrder.indexOf(active.id);
    const newIndex = programOrder.indexOf(over.id);
    setProgramOrder((items) => arrayMove(items, oldIndex, newIndex));
  }

  async function saveProgramsOrder() {
    try {
      setLoading(true);
      const response = await sendData("app/programs", { programOrder }, "PATCH");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("client/programs");
      setIsBeingShuffled(false)
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DndContext onDragEnd={handleDragEnd}>
    <SortableContext items={programOrder}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {programOrder.map((id, index) => {
          const program = programs.find(p => p._id === id);
          return <SortableProgram key={id} program={program} index={index} />;
        })}
      </div>
    </SortableContext>
    <Button
      variant="wz"
      className="mt-10"
      disabled={loading}
      onClick={saveProgramsOrder}
    >
      Save
    </Button>
  </DndContext>
}

function SortableProgram({ program, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: program._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Program program={program} />
    </div>
  );
}

function Program({ program }) {
  return <div
    draggable={true}
    className="bg-[var(--comp-1)] rounded-[10px] border-1 overflow-clip hover:[&_.actions]:opacity-100 animate-wiggle"
  >
    <div>
      <Image
        src={program.image || "/not-found.png"}
        onError={e => e.target.src = "/not-found.png"}
        alt=""
        height={400}
        width={400}
        className="h-auto aspect-video object-cover"
        draggable={false}
      />
    </div>
    <div className="p-4">
      <h2>{program.name}</h2>
    </div>
  </div>
}

function DeleteProgramAction({ id }) {
  async function deleteProgramAction(setLoading, btnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/programs", { programId: id }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("client/programs");
      btnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    action={(setLoading, btnRef) => deleteProgramAction(setLoading, btnRef)}
    description="Are you sure to delete this program?"
  >
    <AlertDialogTrigger>
      <Trash2 className="text-[var(--accent-2)] cursor-pointer w-[18px] h-[18px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}