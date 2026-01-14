import { UploadReport } from "@/app/(authorized)/coach/reports/page";
import ContentError from "@/components/common/ContentError"
import ContentLoader from "@/components/common/ContentLoader"
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs"
import { sendData } from "@/lib/api";
import { retrieveReports } from "@/lib/fetchers/app";
import { cn } from "@/lib/utils";
import { Download, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export default function ClientReports() {
  const { id } = useParams();
  const { isLoading, data, error } = useSWR(
    `reports/client/${id}`,
    () => retrieveReports("coach", id)
  );

  const [previewReport, setPreviewReport] = useState(null);

  if (isLoading) return (
    <TabsContent value="client-reports">
      <ContentLoader />
    </TabsContent>
  );

  if (error || data.status_code !== 200) return (
    <TabsContent value="client-reports">
      <ContentError title={error?.message || data?.message} className="mt-0" />
    </TabsContent>
  );

  const [report] = data?.data || [];
  if (!report) return (
    <TabsContent value="client-reports" className="text-center">
      <p className="mb-4">No report uploaded</p>
      <UploadReport clientId={id} />
    </TabsContent>
  );

  return (
    <TabsContent value="client-reports">
      <div className="mb-10 flex items-center justify-between">
        <h2>Reports</h2>
        <UploadReport clientId={id} />
      </div>
      {report.reports.length === 0 && <div>No reports found</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report?.reports?.map((item, index) =>
          <div key={index} className="min-h-[400px]">
            {item.file_type === "image"
              ? (<div
                onClick={() => setPreviewReport(item)}
                className="max-h-80 h-full relative"
              >
                <Image
                  src={item.file}
                  alt={item.title || "Report Image"}
                  height={1024}
                  width={1024}
                  className="h-full rounded-[10px] object-cover cursor-pointer"
                  onError={e => (e.target.src = "/not-found.png")}
                />
                <Eye className="w-[20px] h-[20px] absolute top-4 left-6 text-[var(--accent-1)] cursor-pointer" />
              </div>)
              : (<div
                onClick={() => setPreviewReport(item)}
                className="max-h-80 h-full cursor-pointer relative"
              >
                <iframe
                  src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(item.file)}`}
                  className="w-full h-full border rounded-lg cursor-pointer"
                />
                <Eye className="w-[20px] h-[20px] absolute top-4 left-6 text-[var(--accent-1)]" />
              </div>
              )}

            <div className="mt-2">
              <h2>{item.title}</h2>
              <p className="text-sm leading-tight">{item.description}</p>
            </div>
            <div className="py-2 flex items-center justify-end gap-1">
              <a href={item.file} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline"><Download /></Button>
              </a>
              <DeleteReport docId={item._id} />
            </div>
          </div>
        )}
      </div>

      <PreviewDialog
        previewReport={previewReport}
        setPreviewReport={setPreviewReport}
      />
      {/* 
      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogTitle>{previewReport?.title}</DialogTitle>
          {previewReport?.file_type === "image" ? (
            <Image
              src={previewReport?.file}
              alt={previewReport?.title || "Preview"}
              height={1200}
              width={1200}
              className="rounded-lg max-h-[80vh] object-contain mx-auto"
            />
          ) : (
            <iframe
              src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(previewReport?.file)}`}
              className="w-full h-[80vh] border rounded-lg"
            />
          )}
          <div className="mt-4 flex justify-end">
            <a
              href={previewReport?.file}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>Download</Button>
            </a>
          </div>
        </DialogContent>
      </Dialog> */}
    </TabsContent>
  );
}

function PreviewDialog({ previewReport, setPreviewReport }) {
  return (
    <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
      <DialogContent className="max-w-[90vw] md:max-w-4xl max-h-[80vh] overflow-auto">
        <DialogTitle>{previewReport?.title}</DialogTitle>

        {previewReport?.file_type === "image" ? (

          <ZoomableImage
            src={previewReport?.file}
            alt={previewReport?.title || "Preview"}
          />
        ) : (
          <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(previewReport?.file)}`}
            className="w-full h-[80vh] border rounded-lg"
          />
        )}

        <div className="mt-4 flex justify-end">
          <a
            href={previewReport?.file}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Download</Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ZoomableImage({ src, alt }) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setOrigin({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - origin.x,
      y: e.clientY - origin.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center">
      <div
        className="overflow-hidden relative"
        style={{
          maxHeight: "70vh",
          maxWidth: "100%",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Image
          src={src}
          alt={alt}
          height={1200}
          width={1200}
          className={cn(
            "rounded-lg object-contain select-none",
            isDragging && scale > 1 ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : ""
          )}
          draggable={false}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.2s ease-in-out",
          }}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={zoomOut}>-</Button>
        <Button size="sm" onClick={resetZoom}>Reset</Button>
        <Button size="sm" onClick={zoomIn}>+</Button>
      </div>
    </div>
  );
}

function DeleteReport({ docId }) {
  const { id } = useParams();

  async function deleteReport(setLoading) {
    try {
      setLoading(true);
      const response = await sendData(
        `app/reports/client?person=coach&clientId=${id}&docId=${docId}`,
        {},
        "DELETE"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure of deleting this report!"
    action={(setLoading, btnRef) => deleteReport(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[28px] h-[28px] text-white bg-[var(--accent-2)] p-[6px] rounded-[4px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}