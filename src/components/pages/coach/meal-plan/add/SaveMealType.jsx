"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveMealType } from "@/config/state-reducers/custom-meal";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SaveMealType({
  children,
  defaulValue = "",
  type,
  index,
  showTrigger = true,
  open: controlledOpen,
  onOpenChange,
  onSave,
}) {
  const [value, setValue] = useState(defaulValue);
  const [internalOpen, setInternalOpen] = useState(false);
  const { dispatch } = useCurrentStateContext();

  const dialogCloseRef = useRef();
  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (open) {
      setValue(defaulValue);
    }
  }, [open, defaulValue]);

  function saveMealTypeHandler() {
    dispatch(saveMealType(value, type, index));
    if (onSave) onSave(value);
    dialogCloseRef.current?.click();
  }

  function deleteMealTypeHandler() {
    dispatch(saveMealType(value, "delete", index));
    dialogCloseRef.current?.click();
  }

  return <Dialog open={open} onOpenChange={handleOpenChange}>
    {showTrigger && !children && <DialogTrigger asChild>
      <Button variant="wz" className="ml-auto">
        <Plus />
        Add
      </Button>
    </DialogTrigger>}
    {children}
    <DialogContent className="gap-0">
      <DialogTitle className="mb-4">Add Type</DialogTitle>
      <Input
        placeholder="Add Meal Type"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <div className="mt-4 flex gap-4 [&_button]:grow">
        <Button variant="wz" onClick={saveMealTypeHandler}>Save</Button>
        {Boolean(defaulValue) && <Button
          variant="destructive"
          onClick={deleteMealTypeHandler}
        >
          Delete
        </Button>}
      </div>
      <DialogClose ref={dialogCloseRef} />
    </DialogContent>
  </Dialog>
}