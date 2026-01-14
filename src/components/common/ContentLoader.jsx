export default function ContentLoader({ className }) {
  return <div className="content-contai ner min-h-[400px] flex items-center justify-center">
    <div
      style={{ clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)" }}
      className="w-8 aspect-square border-4 border-[var(--accent-1)] rounded-full animate-spin"
    />
  </div>
}