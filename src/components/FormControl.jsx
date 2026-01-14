export default function FormControl({
  label,
  className,
  ...props
}) {
  return <label className={className}>
    <span className="label font-[600]">{label}</span>
    <input
      {...props}
      className="w-full input block mt-1 px-4 py-2 rounded-[8px] focus:outline-none border-1 border-[#D6D6D6] placeholder:text-[#1C1B1F]/25"
    />
  </label>
}