import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export default function CustomModal({
  children,
  title,
  content,
}) {
  return <Dialog>
    <DialogTrigger>{children}</DialogTrigger>
    <DialogContent className="max-w-[450px] mx-auto max-h-[75vh] overflow-y-auto p-0">
      <DialogHeader className="p-4 border-b-1 gap-0">
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="p-4">
        {content}
      </div>
    </DialogContent>
  </Dialog>
}