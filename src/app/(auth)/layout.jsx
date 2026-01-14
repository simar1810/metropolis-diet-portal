import Image from "next/image";

export default function layout({ children }) {
  return <div className="bg-[url('/login-bg.png')]">
    <div className="min-h-screen container flex items-center justify-between gap-10">
      <div className="max-w-[900px] w-full bg-white p-8 pt-4 mx-auto shadow-xl border-1 rounded-[20px]">
        <Image
          src="/wz-landscape.png"
          height={60}
          width={150}
          alt="Wz - logo landscape"
          className="mx-auto mb-4"
        />
        <div className="flex items-center gap-6">
          <Image
            src="/login-thumbnail.png"
            height={450}
            width={380}
            alt="Wz - logo landscape"
            className="hidden md:block"
          />
          {children}
        </div>
      </div>
    </div>
  </div>
}  