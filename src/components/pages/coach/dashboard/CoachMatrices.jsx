import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { coachMatricesData } from "@/lib/fetchers/app";
import useSWR from "swr";

export default function CoachMatrices() {
  const { isLoading, error, data } = useSWR("coachMatricesData", coachMatricesData);

  if (isLoading) return <div className="min-w-[400px] bg-white aspect-video flex items-center justify-center animate-pulse">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <ContentError className="w-[400px] aspect- !min-h-[20px] !mt-0" title={error || data.message} />

  const calories = data.data.dailyActivities[data.data.dailyActivities.length - 1].calories / 100;
  const distance = data.data.dailyActivities[data.data.dailyActivities.length - 1].distance / 1000;
  const steps = data.data.dailyActivities[data.data.dailyActivities.length - 1].steps / 100;

  return <Card className="w-[400px] border-1 !shadow-none gap-2 rounded-[10px]">
    <CardHeader className="text-[14px] font-semibold flex items-center justify-between gap-[4px]">
      Activity
    </CardHeader>
    <CardContent className="mt-8">
      <div className="grid grid-cols-3 gap-[32px]">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              className="w-[30px] h-[30px]"
              src="/svgs/flame-icon.svg"
            />
          </Avatar>
          <div>
            <h4 className="!text-[16px]">{calories.toFixed(2)}</h4>
            <p className="text-[var(--dark-2)]">Cal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              className="w-[30px] h-[30px]"
              src="/svgs/flame-icon.svg"
            />
          </Avatar>
          <div>
            <h4 className="!text-[16px]">{distance.toFixed(2)}</h4>
            <p className="text-[var(--dark-2)]">Km</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              className="w-[30px] h-[30px]"
              src="/svgs/flame-icon.svg"
            />
          </Avatar>
          <div>
            <h4 className="!text-[16px]">{steps.toFixed(2)}</h4>
            <p className="text-[var(--dark-2)]">Steps</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
}