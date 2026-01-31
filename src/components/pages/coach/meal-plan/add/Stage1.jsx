export default function Stage1() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-black animate-spin" />
        <h2 className="text-lg font-semibold text-gray-900">Just a moment…</h2>
        <p className="text-sm text-gray-600 max-w-xs">
          We’re fetching your data. Please have a little patience while we
          prepare everything for editing.
        </p>
      </div>
    </div>
  );
}
