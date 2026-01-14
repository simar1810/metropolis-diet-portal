import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import HealthMetrics from "@/components/common/HealthMatrixPieCharts";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import PDFRenderer from "@/components/modals/PDFRenderer";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { sendData } from "@/lib/api";
import { getClientStatsForCoach } from "@/lib/fetchers/app";
import { _throwError } from "@/lib/formatter";
import { clientStatisticsPDFData, comparisonPDFData } from "@/lib/pdf";
import { useAppSelector } from "@/providers/global/hooks";
import { differenceInYears, parse } from "date-fns";
import { FilePen, X } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

export default function ClientStatisticsData({ clientData }) {
  try {
    const { dob, clientId, gender } = clientData
    const [selectedDate, setSelectedDate] = useState(0);

    const { isLoading, error, data, mutate } = useSWR(
      `app/clientStatsCoach?clientId=${clientId}`,
      () => getClientStatsForCoach(clientId)
    );
    const clientStats = data?.data.sort((a, b) => {
      const dateA = parse(a.createdDate, "dd-MM-yyyy", new Date());
      const dateB = parse(b.createdDate, "dd-MM-yyyy", new Date());
      return dateB - dateA;
    });

    async function onUpdateHealthMatrix(formData, name, closeBtnRef) {
      const toastId = toast.loading("Please wait");
      const matrixId = clientStats?.at(selectedDate)?._id;
      try {
        formData.weight = formData.weightInKgs || formData.weightInPounds;
        const other = ["weightInKgs", "weightInPounds"].includes(name)
          ? { weight: formData[name] }
          : { [name]: formData[name] }

        const response = await sendData(
          `app/updateHealthMatrix?id=${matrixId}&clientId=${clientId}`,
          {
            updatedData: {
              ...clientStats?.at(selectedDate),
              ...other
            }
          }, "PUT"
        );
        if (!response.updatedEntry) _throwError(response.message);
        closeBtnRef.current.click();
        toast.success(response.message);
        mutate();
      } catch (error) {
        toast.error(error.message);
      } finally {
        toast.dismiss(toastId);
      }
    }

    if (isLoading) return <ContentLoader />

    if (error || data.status_code !== 200 || isNaN(selectedDate)) return <TabsContent value="statistics">
      <ContentError title={error || data.message} className="mt-0" />
    </TabsContent>

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
      <div className="pb-4 flex items-center gap-2 border-b-1 w-80 md:w-full no-scrollbar overflow-x-auto pt-4">
        {clientStats.map((stat, index) => <div key={index} className="relative">
          <Button
            variant={selectedDate === index ? "wz" : "outline"}
            className={selectedDate !== index && "text-[var(--dark-1)]/25"}
            onClick={() => setSelectedDate(index)}
          >
            {stat.createdDate}
          </Button>
          <DeleteHealthMatrix
            clientId={clientData.clientId}
            healthMatrixId={stat._id}
            isLast={clientStats.length <= 1}
            _id={clientData._id}
          />
        </div>
        )}
      </div>
      <StatisticsExportingOptions
        clientData={clientData}
        clientStats={clientStats}
        selectedDate={selectedDate}
      />
      {!isNaN(weightDifference) && <h5 className="text-[16px] my-4">Weight Difference Between Last Check-up: {parseInt(weightDifference)} KG</h5>}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        <HealthMetrics
          onUpdate={onUpdateHealthMatrix}
          data={payload}
        />
      </div>
    </TabsContent>
  } catch (error) {
    const message = error.message
    return <TabsContent value="statistics">
      <div className="h-[400px] bg-[var(--comp-1)] flex flex-col gap-2 items-center justify-center">
        <p className="font-bold">{message}</p>
      </div>
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

function DeleteHealthMatrix({
  clientId,
  healthMatrixId,
  _id,
  isLast
}) {
  const { cache } = useSWRConfig();

  async function deleteHealthMatrix(setLoading, btnRef) {
    try {
      setLoading(true);
      const response = await sendData(`app/deleteHealthMatrix?clientId=${clientId}&id=${healthMatrixId}`, {}, "DELETE");
      if (response.message !== "Entry deleted successfully") throw new Error(response.message);
      toast.success(response.message);
      if (isLast) {
        window.location = "/coach/clients";
        cache.delete(`clientDetails/${_id}`);
      } else {
        location.reload()
      }
      btnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="You are deleting the Follow Up!"
    action={(setLoading, btnRef) => deleteHealthMatrix(setLoading, btnRef)}
  >
    <AlertDialogTrigger asChild className="absolute top-0 right-0 translate-y-[-40%] translate-x-[40%] ">
      <X className="bg-[var(--accent-2)] p-[2px] rounded-full text-white w-[16px] h-[16px] cursor-pointer" strokeWidth={2} />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}