import { youtubeVideoId } from "@/lib/utils";

export default function YouTubeEmbed({ link }) {
  const videoId = youtubeVideoId(link)
  if (!videoId) return <></>
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  return (
    <iframe
      src={embedUrl}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      className="w-full h-full aspect-video"
    />
  );
};