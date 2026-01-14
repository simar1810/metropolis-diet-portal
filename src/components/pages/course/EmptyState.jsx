export default function EmptyState({ message }) {
  return (
    <div className="rounded-[6px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}