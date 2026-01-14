import QRCode from "qrcode";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppSelector } from "@/providers/global/hooks";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function QRCodeModal() {
  const canvasRef = useRef(null);
  const [open, setOpen] = useState(false);
  const coachId = useAppSelector((state) => state.coach.data?._id);

  const generateQR = async (text) => {
    try {
      if (!canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, text, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#f8f8f8",
        },
      });
    } catch (error) { }
  };

  const downloadPDF = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 20, 20, 170, 170);
    pdf.save("QRCode.pdf");
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        generateQR(coachId || "Hello World");
      }, 0);
    }
  }, [open, coachId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="wz">Attendance QR Code</Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogTitle className="p-4 border-b-1">QR Code</DialogTitle>
        <div className="p-4 mb-4">
          <div className="w-fit bg-[var(--comp-1)] mx-auto border-1 mb-8 shadow-xl rounded-[10px]">
            <canvas
              ref={canvasRef}
              className="block mx-auto my-2"
            />
            <p className="max-w-[40ch] text-[#808080] leading-tight mb-2 mx-auto text-center">Ask your clients to Scan this QR to mark Attendance</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="wz" onClick={downloadPDF}>
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
