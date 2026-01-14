"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { sendData } from "@/lib/api"
import { toast } from "sonner"
import { mutate } from "swr"
import { useAppDispatch } from "@/providers/global/hooks"
import { updateCoachField } from "@/providers/global/slices/coach"

export default function AddCategoryModal({ children }) {
  const [open, setOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [loading, setLoading] = useState(false)
  const closeBtnRef = useRef(null)
  const dispatch = useAppDispatch()

  const handleClose = () => {
    setOpen(false)
    setCategoryName("")
  }

  async function handleSave() {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    try {
      setLoading(true)
      const response = await sendData("app/categories", { addCategory: [categoryName.trim()] })
      if (response.status_code !== 200) throw new Error(response.message)
      mutate("coachProfile")
      dispatch(updateCoachField({ "client_categories": response.data }))
      toast.success(response.message)
      handleClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            Add New Category
          </DialogTitle>
          <DialogDescription>
            Create a new category to organize your clients. Enter a descriptive name below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="categoryName" className="text-sm font-medium">
              Category Name
            </Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter category name..."
              className="col-span-3"
              autoFocus
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading} ref={closeBtnRef}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !categoryName.trim()} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Category
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
