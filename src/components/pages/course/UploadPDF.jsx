import { sendData, sendDataWithFormData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import UploadStatusBadge from "./UploadStatusBadge";
import { cn } from "@/lib/utils";

export default function UploadPDF({ courseId, lecture, upload }) {
  const [status, setStatus] = useState("not-selected") // not-selected, file-selected, uploading, uploaded, error
  const [file, setFile] = useState("")

  async function uploadPDF() {
    const toastId = toast.loading("Uploading pdf...")
    try {
      setStatus("uploading");

      const payload = new FormData();
      payload.append("courseId", courseId)
      payload.append("lectureId", lecture._id)
      payload.append("file", file)

      const response = await sendDataWithFormData(
        "app/courses/lectures/pdf",
        payload,
        "POST"
      )

      if (response.status_code !== 200) _throwError(response.message);
      toast.success(response.message)
      setStatus("uploaded")
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
      setStatus("error")
    } finally {
      toast.dismiss(toastId)
    }
  }

  return <div
    key={lecture._id}
    className={cn(
      "rounded-[6px] border border-slate-200 p-4 shadow-[0px_10px_26px_rgba(15,23,42,0.08)]",
      status === "uploaded" && "cursor-not-allowed opacity-60 select-none"
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-slate-800">{lecture.title || 'Untitled lecture'}</p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          PDF upload
        </p>
      </div>
      <UploadStatusBadge status={status} />
    </div>

    <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-600">
      Select file
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          accept='application/pdf'
          onChange={(event) => {
            if (!event.target.files[0]) return
            setFile(event.target.files[0])
            setStatus("file-selected")
          }}
          disabled={status === "uploaded"}
          className="flex-1 rounded-[6px] border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-[6px] file:border-0 file:bg-[var(--accent-1)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <button
          type="button"
          onClick={uploadPDF}
          disabled={["not-selected", "uploading", "uploaded"].includes(status) || !(file instanceof File)}
          className="inline-flex items-center gap-2 rounded-[6px] bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          <UploadCloud className="h-4 w-4" />
          Upload
        </button>
      </div>
      {upload.fileName ? (
        <span className="text-xs text-slate-500">{upload.fileName}</span>
      ) : (
        <span className="text-xs text-slate-400">
          Accepted formats:video/*
        </span>
      )}
    </label>
  </div>
}