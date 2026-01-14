'use client';
import { CheckCircle2 } from 'lucide-react';
import { sendData } from '@/lib/api';
import { _throwError } from '@/lib/formatter';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';
import UploadVideo from './UploadVideo';
import UploadPDF from './UploadPDF';

export default function AssetUploadPanel({
  visible,
  uploads,
  uploadsComplete,
  createdCourseMeta,
}) {
  const lectures = createdCourseMeta?.lectures || [];
  if (!visible) {
    return (
      <SectionCard
        title="Upload Assets"
        description="Uploads unlock after the course is created."
      >
        <EmptyState message="Create the course to start uploading lecture files." />
      </SectionCard>
    );
  }

  const uploadedCount = lectures.filter(
    (lecture) => uploads[lecture._id]?.status === 'uploaded'
  ).length;

  return (
    <SectionCard
      title="Upload Assets"
      description="Attach the required files for every lecture."
    >
      <div className="mb-4 rounded-[6px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {uploadedCount}/{lectures.length} lectures uploaded
      </div>

      <div className="flex flex-col gap-4">
        {lectures.map((lecture) => {
          if (lecture.lectureType === "video") return <UploadVideo
            key={lecture._id}
            lecture={lecture}
            courseId={createdCourseMeta._id}
            upload={uploads[lecture._id] || {}}
          />
          return <UploadPDF
            key={lecture._id}
            lecture={lecture}
            courseId={createdCourseMeta._id}
            upload={uploads[lecture._id] || {}}
          />
        })}
      </div>

      {uploadsComplete ? (
        <div className="mt-4 inline-flex w-full items-center gap-2 rounded-[6px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          All lectures are uploaded. You can now notify the backend service.
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400">
          Upload every lecture to finish. Videos typically take longer to process.
        </p>
      )}
    </SectionCard>
  );
}

function UploadStatusBadge({ status }) {
  const toneMap = {
    idle: 'bg-slate-100 text-slate-600',
    selected: 'bg-amber-100 text-amber-700',
    uploaded: 'bg-emerald-100 text-emerald-700',
  };
  const labelMap = {
    idle: 'Pending',
    selected: 'Ready to upload',
    uploaded: 'Uploaded',
  };

  return (
    <span className={`rounded-[6px] px-3 py-1 text-xs font-semibold ${toneMap[status] || toneMap.idle}`}>
      {labelMap[status] || labelMap.idle}
    </span>
  );
}


async function uploadLectureFile(lecture, courseId, file, options) {
  if (lecture.lectureType === 'video') {
    return await uploadVideo(lecture, courseId, file, options);
  }
  return await uploadPDF(lecture, courseId, file)
}

async function uploadPDF(lecture, courseId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lectureId', lecture._id);
    formData.append('courseId', courseId);
    const response = await sendData("app/courses/lectures/pdf", formData);
    if (response.status_code !== 200) throw new Error(response.message);
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Please try again later!"
    }
  }
}

async function uploadVideo(lecture, courseId, file, { onChunkUploaded = Function } = {}) {
  try {
    const chunks = splitFileIntoChunks(file, 5);
    for (const chunk of chunks) {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('lectureRef', lecture._id);
      const response = await sendData("app/courses/lectures/video", formData);
      if (response.status_code !== 200) throw new Error(response.message);
      onChunkUploaded(prev => prev + 1)
    }
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Please try again later!"
    }
  }
}

function splitFileIntoChunks(file, chunkSize) {
  const chunks = [];
  for (let i = 0; i < file.size; i += chunkSize) {
    chunks.push(file.slice(i, i + chunkSize));
  }
  return chunks;
}