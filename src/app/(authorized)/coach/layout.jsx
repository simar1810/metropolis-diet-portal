"use server";
import AppNavbar from "@/components/common/AppNavbar";
import AppSidebar from "@/components/common/AppSidebar";
import FAQChatbot from "@/components/common/FAQChatbot";
import Guardian from "@/components/common/Guardian";
import Loader from "@/components/common/Loader";
import UpgradeSubscriptionAlert from "@/components/common/UpgradeSubscriptionAlert";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function Layout({ children }) {
  const cookiesList = await cookies()

  const token = cookiesList.get("token")?.value;
  const _id = cookiesList.get("_id")?.value

  if (!token || !_id) return <div className="h-screen flex items-center justify-center">
    <Loader />
  </div>

  return <Guardian
    _id={_id}
    token={token}
  >
    {/* <FAQChatbot /> */}
    <SidebarProvider className="!bg-white">
      <AppSidebar />
      <div className="w-full md:max-w-[calc(100vw-205px)] grow no-scrollbar">
        <AppNavbar />
        <div className="bg-[var(--comp-2)] p-4">
          <UpgradeSubscriptionAlert />
          {children}
        </div>
      </div>
    </SidebarProvider>
  </Guardian>
}