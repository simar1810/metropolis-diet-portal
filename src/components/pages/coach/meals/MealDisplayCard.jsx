import AssignMealModal from "@/components/modals/Assignmealmodal";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import PDFRenderer from "@/components/modals/PDFRenderer";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { sendData } from "@/lib/api";
import { mealPlanDetailsPDFData } from "@/lib/pdf";
import { EllipsisVertical, FilePen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { mutate } from "swr";

export default function MealDisplayCard({ plan }) {
  async function deleteMealPlan(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/delete-plan?planId=" + plan._id, {}, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message || "Successfully deleted the meal plan!");
      mutate("getPlans");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    } finally {
      setLoading(false);
    }
  }

  return <Card className="p-0 rounded-[4px] shadow-none gap-2">
    <CardHeader className="relative aspect-video">
      <Link href={`/coach/meals/list/${plan._id}`}>
        <Image
          fill
          src={plan.image || "/"}
          onError={e => {
            e.target.src = "/images/meal_plan.jpeg"
            e.target.classList.add("blur-xs")
          }}
          alt=""
          className="object-cover bg-black border-1"
        />
      </Link>
      <Badge variant="wz" className="text-[9px] font-semibold absolute top-2 left-2">{plan.tag}</Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="text-white w-[16px] !absolute top-2 right-2">
          <EllipsisVertical className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="font-semibold">
          {!plan.admin && <>
            <DropdownMenuLabel className="!text-[12px]  font-semibold py-0">
              Edit
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-1" />
          </>}
          <DropdownMenuLabel className="!text-[12px]  font-semibold py-0">
            <Link href={`/coach/meals/add-plan?id=${plan._id}`}>Copy & Edit</Link>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <PDFRenderer pdfTemplate="PDFMealPlan" data={mealPlanDetailsPDFData(plan)}>
              <DialogTrigger className="text-[12px] font-bold flex items-center gap-2">
                Meal Plan PDF
              </DialogTrigger>
            </PDFRenderer>
          </DropdownMenuLabel>
          {!plan.admin &&
            <>
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuLabel className="!text-[12px] font-semibold text-[var(--accent-2)] py-0">
                <DualOptionActionModal
                  description="Do you want to delete the meal plan."
                  action={deleteMealPlan}
                >
                  <AlertDialogTrigger className="font-semibold text-[var(--accent-2)] p-0">
                    Delete
                  </AlertDialogTrigger>
                </DualOptionActionModal>
              </DropdownMenuLabel>
            </>
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
    <CardContent className="p-2">
      <div className="flex items-start justify-between gap-1">
        <Link href={`/coach/meals/list/${plan._id}`}>
          <h5 className="text-[12px]">{plan.name}</h5>
        </Link>
        <AssignMealModal type="normal" planId={plan._id} />
      </div>
      <p className="text-[14px] text-[var(--dark-1)]/25 leading-tight mt-2">
        {plan.description}
      </p>
    </CardContent>
  </Card>
}