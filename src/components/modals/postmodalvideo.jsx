import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "../FormControl";

export default function AddPostModalVideo() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        Add Post(video)
      </DialogTrigger>

      <DialogContent className="!max-w-[500px] border-0 p-0 overflow-auto">
        <DialogHeader className="bg-gray-100 py-4 px-6">
          <DialogTitle className="text-black text-lg">Add New Post</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Post Type Selection */}
          <div className="flex justify-start gap-10 mb-4">
            <FormControl
              type="radio"
              name="postType"
              value="image"
              label="Image"
            />
            <FormControl
              type="radio"
              name="postType"
              value="video"
              label="Video"
              defaultChecked
            />
          </div>

          {/* Caption */}
          <FormControl
            label=""
            type="text"
            name="caption"
            placeholder="Caption"
            className="w-full rounded-md p-2 mb-4  text-sm"
          />

          {/* Video Link */}
          <FormControl
            label=""
            type="text"
            name="videoLink"
            placeholder="Video Link"
            className="w-full rounded-md p-2 mb-6 text-sm"
          />

          {/* Community Selection */}
          <p className="text-sm font-semibold mb-2">Select Community</p>
          <div className="grid grid-cols-1 gap-2 mb-6 border p-2 rounded-md">
            <FormControl
              type="radio"
              name="community"
              value="global"
              label="Global Community"
              defaultChecked
            />
            <FormControl
              type="radio"
              name="community"
              value="personal"
              label="Personal Community"
            />
          </div>

          {/* Post Button */}
          <button className="bg-gray-400 text-white font-bold w-full px-4 py-2 rounded cursor-not-allowed">
            Post
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
