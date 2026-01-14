export default function SectionCard({ title, description, children }) {
return (
<section className="rounded-[6px] border border-slate-200 bg-white p-5 shadow-[0px_14px_32px_rgba(15,23,42,0.08)]">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    {description ? <p className="text-sm text-slate-500">{description}</p> : null}
  </div>
  {children}
</section>
);
}