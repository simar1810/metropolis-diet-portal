"use client"
import PDFComparison from "@/components/pages/coach/client/PDFComparison";
import PDFShareStatistics from "@/components/pages/coach/client/PDFShareStatistics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PDFInvoice from "../pages/coach/meals/PDFInvoice";
import PDFMealPlan from "../pages/coach/meals/PDFMealPlan";
import PDFDailyMealSchedule from "../pages/coach/meals/PDFDailyMealSchedule";
import PDFCustomMealPortrait from "../pages/coach/meals/PDFCustomMealPortrait";
import PDFCustomMealLandscape from "../pages/coach/meals/PDFCustomMealLandscape";
import PDFCustomMealCompactLandscape from "../pages/coach/meals/PDFCustomMealCompactLandscape";
import PDFCustomMealCompactPortrait from "../pages/coach/meals/PDFCustomMealCompactPortrait";
import useSWR from "swr";
import { getPersonalBranding } from "@/lib/fetchers/app";
import ContentLoader from "../common/ContentLoader";
import ContentError from "../common/ContentError";
import { getBase64ImageFromUrl } from "@/lib/image";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/providers/global/hooks";
import MembershipInvoicePDF from "@/components/modals/MembershipInvoicePDF"

const Templates = {
  PDFComparison,
  PDFShareStatistics,
  PDFInvoice,
  PDFMealPlan,
  PDFDailyMealSchedule,
  PDFCustomMealPortrait,
  PDFCustomMealLandscape,
  PDFCustomMealCompactLandscape,
  PDFCustomMealCompactPortrait,
  MembershipInvoicePDF
}

export default function PDFRenderer({ children, pdfTemplate, data }) {
  const Component = Templates[pdfTemplate]
  return <Dialog>
    {children}
    <DialogContent className="h-[95vh] min-w-[95vw] border-b-0 p-0 block gap-0 overflow-y-auto">
      <DialogHeader className="p-0 z-100">
        <DialogTitle className="text-[24px]" />
      </DialogHeader>
      <Container
        Component={Component}
        pdfData={data}
      />
    </DialogContent>
  </Dialog>
}

function Container({ Component, pdfData }) {
  const { profilePhoto } = useAppSelector(state => state.coach.data)

  const [brandLogo, setBrandLogo] = useState("");
  const [coachLogo, setCoachLogo] = useState("");
  const { isLoading, error, data } = useSWR("app/personalBranding", getPersonalBranding);

  const brands = Array.isArray(data?.data) ? data.data : [];

  useEffect(function () {
    const latestBrand = brands.length > 0 ? brands[brands.length - 1] : null;

    if (latestBrand?.brandLogo) {
      getBase64ImageFromUrl(latestBrand.brandLogo).then(setBrandLogo);
    }

    if (profilePhoto) {
      getBase64ImageFromUrl(profilePhoto).then(setCoachLogo);
    }
  }, [brands, profilePhoto])

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error?.message || data?.message} />

  const primaryBrand = brands[0] || {};
  const latestBrand = brands.length > 0 ? brands[brands.length - 1] : {};
  const primaryColor = latestBrand?.primaryColor ? `#${latestBrand.primaryColor.slice(-6)}` : "#00984A";
  const textColor = latestBrand?.textColor ? `#${latestBrand.textColor.slice(-6)}` : "#ffffff";

  return <Component
    data={pdfData}
    brand={{
      ...primaryBrand,
      brandLogo,
      coachLogo,
      primaryColor,
      textColor
    }}
  />
}
