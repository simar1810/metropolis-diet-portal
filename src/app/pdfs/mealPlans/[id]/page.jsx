"use client";

import useSWR from "swr";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import PDFRenderer from "@/components/modals/PDFRenderer";

import React from "react";
import {
  Document,
  Page as PDFPage,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import { useParams } from "next/navigation";
import { getCustomMealPlans } from "@/lib/fetchers/app";

Font.register({ family: "NotoSans", src: "/fonts/Roboto-Regular.ttf" });

const getStyles = function (brand) {
  return StyleSheet.create({

  });
}

export default function Page() {
  const { id } = useParams()
  const { isLoading, error, data } = useSWR(`custom-meal-plans/${id}`, () => getCustomMealPlans("coach", id));
  if (isLoading) return <ContentLoader />
  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  return <main className="content-container h-[90vh] mx-4">
    <Component data={data} />
  </main>
}

function Component({ data }) {
  if (data.mode === "daily") return <ModeDaily data={data} />
  if (data.mode === "weekly") return <ModeWeekly data={data} />
  if (data.mode === "monthly") return <ModeMonthly data={data} />
}

function ModeDaily({ data }) {
  return <PDFViewer className="w-full h-full">
    <Document>
      <PDFPage size="A4">
        <Text>This is daily mode</Text>
      </PDFPage>
    </Document>
  </PDFViewer>
}

function ModeWeekly({ data }) {
  return <PDFViewer className="w-full h-full">
    <Document>
      <PDFPage size="A4">
        <Text>This is weekly mode</Text>
      </PDFPage>
    </Document>
  </PDFViewer>
}

function ModeMonthly({ data }) {
  return <PDFViewer className="w-full h-full">
    <Document>
      <PDFPage size="A4">
        <Text>This is monthly mode</Text>
      </PDFPage>
    </Document>
  </PDFViewer>
}