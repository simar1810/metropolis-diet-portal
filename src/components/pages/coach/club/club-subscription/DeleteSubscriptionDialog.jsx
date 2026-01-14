"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Loader2, Trash2 } from "lucide-react"; // Loader and Delete icon
import { sendData } from "@/lib/api";

export default function DeleteSubscriptionDialog({ subscriptionId, onDeleted }) {
  const { id } = useParams();

  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await sendData(
        `app/clubSubscription/coach/${id}`,
        { subscriptionId },
        "DELETE"
      );

      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success("Subscription deleted successfully!");
        setOpen(false);
        onDeleted();
      }
    } catch (err) {
      toast.error("Failed to delete subscription");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        className="p-1"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <DialogTitle>Delete Subscription</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-gray-700">
            Are you sure you want to delete this subscription? This action cannot be undone.
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
