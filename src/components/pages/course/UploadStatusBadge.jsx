export default function UploadStatusBadge({ status }) {
  const toneMap = {
    'not-selected': 'bg-slate-100 text-slate-600',
    'file-selected': 'bg-blue-100 text-blue-700',
    uploading: 'bg-purple-100 text-purple-700',
    uploaded: 'bg-emerald-100 text-emerald-700',
  };

  const labelMap = {
    'not-selected': 'Not selected',
    'file-selected': 'File selected',
    uploading: 'Uploading…',
    uploaded: 'Uploaded',
  };

  return (
    <span className={`rounded-[6px] px-3 py-1 text-xs font-semibold ${toneMap[status] || toneMap.idle}`}>
      {labelMap[status] || labelMap.idle}
    </span>
  );
}