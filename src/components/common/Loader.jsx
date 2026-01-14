export default function Loader({ className }) {
  return <div
    style={{ clipPath: "polygon(0% 0%, 100% 100%, 0% 100%)" }}
    className={`w-8 aspect-square border-4 border-[var(--accent-1)] rounded-full animate-spin ${className}`}
  />
}