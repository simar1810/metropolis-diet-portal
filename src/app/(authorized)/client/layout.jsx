"use server";
import AppClientNavbar from "@/components/client/AppClientNavbar";
import AppClientSidebar from "@/components/client/AppClientSidebar";
import ClientGuardian from "@/components/client/ClientGuardian";
import FAQChatbot from "@/components/common/FAQChatbot";
import Loader from "@/components/common/Loader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function Layout({ children }) {
  const cookiesList = await cookies()

  const token = cookiesList.get("token")?.value;
  const _id = cookiesList.get("_id")?.value

  if (!token) return <div className="h-screen flex items-center justify-center">
    <Loader />
  </div>

  return <ClientGuardian
    _id={_id}
    token={token}
  >
    {/* <FAQChatbot /> */}
    <SidebarProvider className="!bg-white">
      <AppClientSidebar />
      <div className="md:max-w-[calc(100vw-205px)] grow no-scrollbar">
        <AppClientNavbar />
        <div className="bg-[var(--comp-2)] p-4">
          {children}
        </div>
      </div>
    </SidebarProvider>
  </ClientGuardian>
}