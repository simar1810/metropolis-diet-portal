import Image from "next/image";

export default function NoData({ message }) {
  return <div className="w-fit mx-auto my-10">
    <Image
      src="/illustrations/no-data.svg"
      alt=""
      height={540}
      width={540}
      className="h-[140px] mx-auto"
    />
    <p className="text-center text-[var(--dark-2)] mt-4">{message}</p>
  </div>
}