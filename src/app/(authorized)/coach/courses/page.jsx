"use client"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Suspense, useState } from "react"
import useSWR, { mutate } from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { fetchData, sendData } from "@/lib/api";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, EllipsisVertical, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks";
import { updateCoachField } from "@/providers/global/slices/coach";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Page() {
  const searchParams = useSearchParams()
  const isFirstTime = searchParams.get("isFirstTime")
  const [value, setValue] = useState("")
  return <div className="content-container content-height-screen">
    <Suspense>
      <Header value={value} setValue={setValue} />
      <CourseLintings isFirstTime={isFirstTime === "true"} />
    </Suspense>
  </div>
}

function Header({ value, setValue }) {
  const dispatch = useAppDispatch();
  const ytDocRef = useAppSelector(state => state.coach.data?.ytDocRef);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);

  async function handleDisconnectYoutube(setLoading, closeBtnRef) {
    if (!ytDocRef) {
      toast.error("No YouTube account connected.");
      closeBtnRef?.current?.click();
      return;
    }
    try {
      setLoading(true);
      const response = await sendData("app/youtube/oauth", {}, "DELETE");
      if (response?.status_code !== 200) throw new Error(response?.message || "Unable to disconnect YouTube.");
      toast.success(response?.message || "YouTube account disconnected.");
      mutate("coachProfile");
      dispatch(updateCoachField({ ytDocRef: null }));
      closeBtnRef?.current?.click();
    } catch (error) {
      toast.error(error?.message || "Unable to disconnect YouTube. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="flex items-center justify-between gap-4">
    <h4>Courses</h4>
    <Input
      className="max-w-sm ml-auto"
      placeholder="search by title..."
      value={value}
      onChange={e => setValue(e.target.value)}
    />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="text-black bg-white rounded-full hover:bg-[var(--accent-1)]/90"
          aria-label="Course options"
        >
          <EllipsisVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-0">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link className="w-full py-1.5" href="/coach/courses/creation">
            Create
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link className="w-full py-1.5" href="/coach/courses/analytics">
            Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() => ytDocRef && setDisconnectModalOpen(true)}
          disabled={!ytDocRef}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          Disconnect YouTube
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {disconnectModalOpen && <DualOptionActionModal
      open={disconnectModalOpen}
      onOpenChange={setDisconnectModalOpen}
      onClose={() => setDisconnectModalOpen(false)}
      description="Disconnecting will remove access to YouTube uploads. Continue?"
      action={handleDisconnectYoutube}
    >
      <AlertDialogTrigger />
    </DualOptionActionModal>}
  </div>
}

function CourseLintings({ isFirstTime }) {
  const { isLoading, error, data } = useSWR(
    "app/courses/all",
    () => fetchData("app/courses/details")
  );

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  const courses = data.data ?? []

  if (courses.length === 0) return <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
    <div className="text-5xl mb-4">📕</div>
    <h2 className="text-2xl font-semibold text-gray-800">No Courses Yet</h2>
    <p className="text-gray-500 mt-1">Create your first course to get started.</p>
    <Link
      href="/coach/courses/creation"
      className="w-[12ch] text-center bg-[var(--accent-1)] px-4 py-2 rounded-full text-white font-bold"
    >Create</Link>
  </div>

  return <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {courses.map(course => <CourseDetails
      key={course._id}
      course={course}
    />)}
    {isFirstTime && <WarningModalToVerifyYTAccount />}
  </div>
}

function CourseDetails({ course }) {
  return <div className="bg-[var(--comp-1)] border-1 rounded-[6px] overflow-clip">
    <Link href={`/coach/courses/${course._id}`}>
      <Image
        src={course.thumbnail || "/not-found.png"}
        onError={e => e.target.src = "/not-found.png"}
        height={200}
        width={400}
        className="w-full aspect-video object-cover border-b-1"
        alt=""
      /></Link>
    <div className="p-4 ">
      <p className="font-bold">{course.title}</p>
      <p className="text-sm text-[#808080]">{course.description}</p>
    </div>
  </div>
}

function WarningModalToVerifyYTAccount() {
  const router = useRouter()
  function copyLink() {
    {
      copyText("https://www.youtube.com/verify")
      toast.success("Link Copied.")
    }
  }
  return <Dialog defaultOpen={true}>
    <DialogTrigger />
    <DialogContent className="p-0">
      <DialogTitle className="text-red-500 flex items-center gap-4 p-4 border-b-1">
        <TriangleAlert />
        Warning:
      </DialogTitle>
      <div className="p-4">
        <p className="mb-4">Warning: Your YouTube account is unverified. Video uploads are limited to 15 minutes. Verify your account at the following link to enable longer uploads.</p>
        <div className="flex items-center gap-4">
          <div onClick={copyLink} className="grow border-1 px-4 py-2 text-sm bg-[var(--comp-1)] rounded-[4px] select-none cursor-pointer">
            https://www.youtube.com/verify
          </div>
          <Button onClick={copyLink}>
            <Copy />
          </Button>
        </div>
        <DialogClose asChild>
          <Button
            variant="wz"
            className="mt-4"
            onClick={() => {
              router.replace("/coach/courses")
            }}
          >
            Verified
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
}