"use client";

import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { retrieveSessions } from "@/lib/fetchers/app";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { youtubeVideoId } from "@/lib/utils"
import { CalendarDays, Clock, User, Play, Pen, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import UpdateSessionModal from "@/components/modals/UpdateSessionModal";

export default function SessionsListingPage() {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const { isLoading, error, data } = useSWR("sessions", () => retrieveSessions("coach"));
  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />

  const sessions = data.data
  const getYouTubeThumbnail = (videoUrl) => {
    const videoId = youtubeVideoId(videoUrl)
    if (!videoId) return "/video-thumbnail.png"
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleThumbnailClick = (videoUrl, sessionName) => {
    setSelectedVideo({ url: videoUrl, title: sessionName })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse py-0">
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <CardContent className="px-4 py-0">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="content-container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Training Sessions</h1>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No sessions available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session._id} className="overflow-hidden hover:shadow-lg transition-shadow py-0">
              <div className="relative group">
                <div
                  className="aspect-video cursor-pointer relative overflow-hidden"
                  onClick={() => session.videoUrl && handleThumbnailClick(session.videoUrl, session.name)}
                >
                  <img
                    src={
                      session.videoUrl
                        ? getYouTubeThumbnail(session.videoUrl)
                        : "/not-found.png"
                    }
                    onError={e => e.target.src = "/not-found.png"}
                    alt={session.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {session.videoUrl && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-3">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    {session.workoutType}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{session.name}</h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{session.trainerName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {session.day} • {formatDate(session.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{session.time}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {(session.availability || []).map((avail) => (
                    <Badge key={avail} variant="outline" className="text-xs">
                      {avail}
                    </Badge>
                  ))}
                  {session.admin && (
                    <Badge variant="default" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <UpdateSessionModal session={session} />
                  <DeleteSession sessionId={session._id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.url || ""}
        title={selectedVideo?.title}
      />
    </div>
  )
}

export function VideoModal({ isOpen, onClose, videoUrl, title }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogTitle />
        <div className="aspect-video w-full">
          <YouTubeEmbed link={videoUrl} />
        </div>
        {title && (
          <div className="p-4">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DeleteSession({ sessionId }) {

  async function deleteNote(
    setLoading,
    closeBtnRef
  ) {
    try {
      setLoading(true);
      const response = await sendData("app/workout/sessions", { sessionId }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      mutate("sessions");
      closeBtnRef.current.click()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="You are deleting a session! Are you sure?"
    action={(setLoading, btnRef) => deleteNote(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[16px] h-[16px] cursor-pointer hover:scale-[1.1] text-[var(--accent-2)] " />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}