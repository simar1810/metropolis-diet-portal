import { NextResponse } from 'next/server';
import { PdfService } from '@/services/pdf.service';

export async function POST(req) {
  try {
    const payload = await req.json();
    console.log(payload)
    const pdfBuffer = await PdfService.generateMealPlanPdfBuffer(payload);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${payload.title || 'meal-plan'}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}