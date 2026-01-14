"use client"

import { useRef, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SelectMultiple from "@/components/SelectMultiple"
import { useAppSelector } from "@/providers/global/hooks"
import { toast } from "sonner"
import { mutate } from "swr"
import { Pen } from "lucide-react"
import { format } from "date-fns"
import { sendData } from "@/lib/api"

export default function UpdateSessionModal({ session }) {
  const { client_categories } = useAppSelector((state) => state.coach.data)

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    sessionId: session._id,
    name: session.name || "",
    trainerName: session.trainerName || "",
    day: session.day || "",
    date: format(new Date(session.date), "yyyy-MM-dd"),
    workoutType: session.workoutType || "",
    time: session.time || "",
    videoUrl: session.videoUrl || "",
    availability: session.availability || [],
  })

  const closeBtnRef = useRef()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const availabilityOptions = [
    { id: 1, name: "All Client", value: "client" },
    ...client_categories.map((category, index) => ({
      id: index + 2,
      name: category.name,
      value: category.name,
    })),
  ]

  async function saveSession() {
    try {
      setIsLoading(true);
      const response = await sendData("app/workout/sessions", formData, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      mutate("sessions");
      toast.success(response.message || "Successfull")
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateSession = async (e) => {
    e.preventDefault()
    if (!session) return
    await saveSession()
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Pen className="w-[16px] h-[16px] cursor-pointer hover:scale-[1.1] text-[var(--accent-1)]" />
      </DialogTrigger>
      <DialogContent className="max-w-[450px]">
        <DialogTitle>Update Session</DialogTitle>

        <form onSubmit={handleUpdateSession} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-name">Session Name</Label>
            <Input
              id="update-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter session name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-trainerName">Trainer Name</Label>
            <Input
              id="update-trainerName"
              value={formData.trainerName}
              onChange={(e) => handleInputChange("trainerName", e.target.value)}
              placeholder="Enter trainer name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="update-day">Day</Label>
              <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-time">Time</Label>
              <Input
                id="update-time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-date">Date</Label>
            <Input
              id="update-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>

          <div className="gap-4 grid grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="update-workoutType">Workout Type</Label>
              <Select value={formData.workoutType} onValueChange={(value) => handleInputChange("workoutType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-availability">Availability</Label>
              <SelectMultiple
                options={availabilityOptions}
                value={formData.availability}
                onChange={(value) => handleInputChange("availability", value)}
                className="mb-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-videoUrl">Video URL</Label>
            <Input
              id="update-videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              placeholder="https://example.com/video"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="wz" className="flex-1" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Session"}
            </Button>
          </div>
        </form>
        <DialogClose ref={closeBtnRef} />
      </DialogContent>
    </Dialog>
  )
}
