import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";

export default function PDFPreview({ children, fileLink }) {
  return <Dialog>
    {!children && <DialogTrigger></DialogTrigger>}
    {children}
    <DialogContent className="p-2 rounded-[4px] max-h-[75vh] overflow-y-auto">
      <DialogTitle />
      <iframe
        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileLink)}`}
        className="w-full h-[80vh] border rounded-lg"
      />
    </DialogContent>
  </Dialog>
}