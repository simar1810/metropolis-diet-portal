export default function ContentError({
  title,
  description,
  className
}) {
  return <div className={`content-container min-h-[400px] flex items-center justify-center ${className}`}>
    {title}
  </div>
}