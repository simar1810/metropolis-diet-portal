"use client"

import { useRef, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import FormControl from "@/components/FormControl"
import { marathonTaskFields } from "@/config/data/ui"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { mutate } from "swr"
import { sendData } from "@/lib/api"
import { Plus } from "lucide-react"

export default function CreateMarathonTaskModal() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "",
    videoSubmission: false,
    photoSubmission: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const closeBtnRef = useRef()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  async function handleSubmit() {
    try {
      setIsLoading(true);
      const response = await sendData("app/marathon/coach/task-options", formData);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-bold flex items-center justify-center gap-2" size="sm">
          <Plus size={18} className="text-white"/>
          <p className="text-white">New Task</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-[500px] max-h-[75vh] overflow-y-auto border-0 p-0 gap-0">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold">New Marathon Task</DialogTitle>
        </DialogHeader>
        <div className="px-6 pt-4 pb-6 space-y-4">
          {marathonTaskFields.map((field) => renderField(field, handleInputChange, formData))}
          <DialogClose ref={closeBtnRef} />
          <Button
            variant="wz"
            disabled={isLoading}
            className="w-full mt-4"
            onClick={handleSubmit}
          >
            {isLoading ? "Creating Document..." : "Create Document"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function renderField(field, handleInputChange, formData) {
  const commonProps = {
    name: field.name,
    placeholder: field.placeholder,
    onChange: handleInputChange,
  }

  switch (field.type) {
    case "textarea":
      return (
        <div key={field.id}>
          <FormControl {...commonProps} label={field.label} value={formData[field.name]} className="w-full" />
        </div>
      )

    case "checkbox":
      return (
        <div key={field.id}>
          <FormControl
            {...commonProps}
            type="checkbox"
            label={field.label}
            checked={formData[field.name]}
            className="w-full flex items-center justify-between [&_.input]:w-auto"
          />
        </div>
      )

    case "number":
      return (
        <div key={field.id}>
          <FormControl {...commonProps} label={field.label} type="number" value={formData[field.name]} className="w-full" />
        </div>
      )

    default:
      return (
        <div key={field.id}>
          <FormControl {...commonProps} label={field.label} type="text" value={formData[field.name]} className="w-full" />
        </div>
      )
  }
}