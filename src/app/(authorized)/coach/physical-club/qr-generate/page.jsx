"use client"
import { useRef, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/providers/global/hooks";

export default function QRCodeToPDF({ text }) {
  const canvasRef = useRef(null)
  const [qrGenerated, setQrGenerated] = useState(false)
  const coachId = useAppSelector(state => state.coach.data._id)

  const generateQR = async () => {
    try {
      if (!coachId) return
      const canvas = canvasRef.current
      await QRCode.toCanvas(canvas, coachId, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#f8f8f8"
        }
      })
      setQrGenerated(true)
    } catch (error) {
    }
  }

  const downloadPDF = () => {
    if (!qrGenerated) return
    const canvas = canvasRef.current
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width + 40, canvas.height + 40]
    })
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, canvas.width + 40, canvas.height + 40, "F")
    pdf.setDrawColor("#00984A")
    pdf.setLineWidth(2)
    pdf.rect(20, 20, canvas.width, canvas.height)
    pdf.addImage(imgData, "PNG", 20, 20, canvas.width, canvas.height)
    pdf.save("QRCode.pdf")
  }

  return (
    <div className="content-container content-height-screen">
      <h4>QR Code</h4>
      <canvas
        ref={canvasRef}
        className="block mx-auto my-10"
        style={{ border: qrGenerated ? "2px solid #00984A" : "none" }}
      />
      <div className="flex items-center justify-center gap-4">
        {!qrGenerated && <Button variant="wz" onClick={generateQR}>Generate QR</Button>}
        {qrGenerated && <Button variant="wz" onClick={downloadPDF} disabled={!qrGenerated}>
          Download PDF
        </Button>}
      </div>
    </div>
  )
}
