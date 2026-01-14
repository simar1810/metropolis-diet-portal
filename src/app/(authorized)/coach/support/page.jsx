import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io";

export default function Page() {
  return <div className="content-height-screen content-container">
    <h4>Help and Support</h4>
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <Image
        src="/illustrations/support.svg"
        alt="Support illustration"
        height={250}
        width={250}
        className="object-contain mb-6"
      />
      <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800">We're Here to Help</h3>

      <div className="w-full max-w-md space-y-4 mb-8">
        <Button
          variant="wz_outline"
          className="w-full text-black h-auto py-4 flex items-center justify-start gap-3 border-2 hover:bg-[var(--comp-1)] transition-colors"
          asChild
        >
          <a href="https://wa.me/9876543210" target="_blank" rel="noopener noreferrer">
            <IoLogoWhatsapp className="text-[var(--accent-1)] text-xl min-w-[24px]" />
            <span className="font-medium">WhatsApp Support</span>
            <span className="ml-auto text-sm text-gray-600">9876543210</span>
          </a>
        </Button>

        <Button
          variant="wz_outline"
          className="w-full text-black h-auto py-4 flex items-center justify-start gap-3 border-2 hover:bg-[var(--comp-1)] transition-colors"
          asChild
        >
          <a href="tel:9876543210">
            <Phone className="text-[var(--accent-1)] min-w-[24px]" fill="#00984A" />
            <span className="font-medium">Call Support</span>
            <span className="ml-auto text-sm text-gray-600">9876543210</span>
          </a>
        </Button>

        <Button
          variant="wz_outline"
          className="w-full text-black h-auto py-4 flex items-center justify-start gap-3 border-2 hover:bg-[var(--comp-1)] transition-colors border-[var(--accent-1)]"
          asChild
        >
          <Link
            href="https://forms.gle/16EMvPCUip6mzer38"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <FileText className="text-[var(--accent-1)] min-w-[24px]" />
            <span className="font-medium">Submit a Request</span>
            <ExternalLink className="ml-auto text-[var(--accent-1)] min-w-[20px]" size={18} />
          </Link>
        </Button>
      </div>

      <p className="text-sm text-gray-600 text-center max-w-md">
        Need assistance? Reach out to us through any of the channels above. We typically respond within 24 hours.
      </p>
    </div>
  </div>
}