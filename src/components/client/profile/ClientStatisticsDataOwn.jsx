import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import HealthMetrics from "@/components/common/HealthMatrixPieCharts";
import PDFRenderer from "@/components/modals/PDFRenderer";
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { getClientMatrices, getClientStatsForCoach } from "@/lib/fetchers/app";
import { clientStatisticsPDFData, comparisonPDFData } from "@/lib/pdf";
import { useAppSelector } from "@/providers/global/hooks";
import { differenceInYears, parse } from "date-fns";
import { FilePen } from "lucide-react"
import { useState } from "react";
import useSWR from "swr";

export default function ClientStatisticsDataOwn({ clientData }) {
  try {
    const { dob, gender } = clientData
    const [selectedDate, setSelectedDate] = useState(0);

    const { isLoading, error, data } = useSWR("clientStatistics", () => getClientMatrices("client"));

    if (isLoading) return <ContentLoader />

    if (error || data.status_code !== 200 || isNaN(selectedDate)) return <TabsContent value="statistics">
      <ContentError title={error || data.message} className="mt-0" />
    </TabsContent>
    const clientStats = data?.data?.at(0)?.healthMatrix || [];
    const payload = {
      ...clientStats?.at(selectedDate),
      age: dob
        ? differenceInYears(new Date(), parse(dob, 'dd-MM-yyyy', new Date()))
        : 0,
      bodyComposition: clientStats?.at(selectedDate)?.body_composition,
      gender,
      heightCms: clientStats?.at(selectedDate)?.heightUnit?.toLowerCase() === "cm"
        ? clientStats?.at(selectedDate)?.height
        : "",
      heightFeet: clientStats?.at(selectedDate)?.heightUnit?.toLowerCase() === "inches"
        ? (clientStats?.at(selectedDate)?.height?.split("."))[0]
        : "",
      heightInches: clientStats?.at(selectedDate)?.heightUnit?.toLowerCase() === "inches"
        ? (clientStats?.at(selectedDate)?.height?.split("."))[1]
        : "",
      weightInKgs: clientStats?.at(selectedDate)?.weightUnit?.toLowerCase() === "kg"
        ? clientStats?.at(selectedDate)?.weight
        : "",
      weightInPounds: clientStats?.at(selectedDate)?.weightUnit?.toLowerCase() === "pounds"
        ? clientStats?.at(selectedDate)?.weight
        : "",
    }
    const weightDifference = Math.abs(Number(clientStats?.at(0)?.weight) - Number(clientStats?.at(1)?.weight))

    return <TabsContent value="statistics">
      <div className="pb-4 flex items-center gap-2 border-b-1 overflow-x-auto">
        {clientStats.map((stat, index) => <Button
          key={index}
          variant={selectedDate === index ? "wz" : "outline"}
          className={selectedDate !== index && "text-[var(--dark-1)]/25"}
          onClick={() => setSelectedDate(index)}
        >
          {stat.createdDate}
        </Button>)}
      </div>
      {!isNaN(weightDifference) && <h5 className="text-[16px] mt-4">Weight Difference Between Last Check-up: {weightDifference} KG</h5>}
      <div className="mt-8 grid md:grid-cols-3 gap-5">
        <HealthMetrics data={payload} />
      </div>
    </TabsContent>
  } catch (error) {
    return <TabsContent value="statistics">
      <ContentError title={error.message} className="mt-0" />
    </TabsContent>
  }
}

function StatisticsExportingOptions({
  clientData,
  clientStats,
  selectedDate
}) {
  const coach = useAppSelector(state => state.coach.data);

  return <div className="py-4 text-[12px] flex items-center gap-2 border-b-1 overflow-x-auto">
    <PDFRenderer pdfTemplate="PDFComparison" data={comparisonPDFData(clientData, clientStats, coach, selectedDate)}>
      <DialogTrigger className="h-9 px-4 flex items-center gap-2 border-1 rounded-[8px]">
        <FilePen className="w-[14px]" />
        Share & View Comparison PPT
      </DialogTrigger>
    </PDFRenderer>
    <PDFRenderer pdfTemplate="PDFShareStatistics" data={clientStatisticsPDFData(clientData, clientStats, coach, selectedDate)}>
      <DialogTrigger className="h-9 px-4 flex items-center gap-2 border-1 rounded-[8px]">
        <FilePen className="w-[14px]" />
        Share Statistics ({clientStats?.at(selectedDate).createdDate})
      </DialogTrigger>
    </PDFRenderer>
  </div>
}