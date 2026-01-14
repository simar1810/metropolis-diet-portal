import { Progress } from "@/components/ui/progress";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";
import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import UploadStatusBadge from "./UploadStatusBadge";

export default function UploadVideo({ courseId, lecture, upload }) {
  const [status, setStatus] = useState("not-selected"); // not-selected, file-selected, uploading, uploaded, error
  const [file, setFile] = useState("");
  const [progress, setProgress] = useState(0);

  async function initiateVideoUpload() {
    setStatus("uploading")
    const toastId = toast.loading("Initiating video upload.");
    try {
      if (!(file instanceof File)) _throwError("please select a file")

      const payload = {
        fileSize: file.size,
        courseId,
        lectureId: lecture._id
      }

      const response = await sendData(
        "app/courses/upload-videos",
        payload,
        "POST"
      )
      if (response.status_code !== 200) _throwError(response.message)

      const { status, message } = await uploadChunks(file, lecture._id, setProgress)
      if (!status) _throwError(message)
      setStatus("uploaded")
    } catch (error) {
      toast.error(error.message || "Something went wrong!")
      setStatus("error")
    } finally {
      toast.dismiss(toastId)
    }
  }

  return <div
    key={lecture._id}
    className="rounded-[6px] border border-slate-200 p-4 shadow-[0px_10px_26px_rgba(15,23,42,0.08)]"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-slate-800">{lecture.title || 'Untitled lecture'}</p>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {lecture.lectureType === 'video' ? 'Video' : 'PDF'} upload
        </p>
      </div>
      <UploadStatusBadge status={status} />
    </div>

    <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-600">
      Select file
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          accept='video/*'
          onChange={(event) => {
            if (!event.target.files[0]) return
            setFile(event.target.files[0])
            setStatus("file-selected")
          }}
          className="flex-1 rounded-[6px] border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-[6px] file:border-0 file:bg-[var(--accent-1)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <button
          type="button"
          onClick={initiateVideoUpload}
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
    <Progress value={progress} />
  </div>
}

async function uploadChunks(file, lectureRef, setProgress) {
  try {
    const CHUNK_SIZE = 5242880;
    const TOTAL_CHUNKS = Math.ceil(file.size / CHUNK_SIZE);
    const CHUNKS = []
    for (let index = 0; index < TOTAL_CHUNKS; index++) {
      const start = CHUNK_SIZE * index;
      const end = start + CHUNK_SIZE;
      CHUNKS.push(new File([file.slice(start, end)], file.name, { type: file.type }))
    }

    let uploadedChunks = 0;
    for (const chunk of CHUNKS) {
      const { status, message } = await uploadChunk(lectureRef, chunk)
      if (!status) _throwError(message)
      uploadedChunks++
      setProgress(Math.ceil(uploadedChunks / TOTAL_CHUNKS * 100))
    }
    return { status: true }
  } catch (error) {
    return {
      status: false,
      message: error.message || "Something went wrong!"
    }
  }
}

async function uploadChunk(lectureRef, chunk) {
  try {
    const payload = new FormData()
    payload.append("lectureRef", lectureRef)
    payload.append("chunk", chunk)
    const response = await sendDataWithFormData(
      "app/courses/upload-videos",
      payload,
      "PUT"
    );
    if (response.status_code !== 200) _throwError(response.message);
    return { status: true }
  } catch (error) {
    return {
      status: false,
      message: error.message || "Something went wrong"
    }
  }
}