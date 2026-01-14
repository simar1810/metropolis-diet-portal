import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { CalendarRange } from "lucide-react";
import useCurrentStateContext, {
  CurrentStateProvider,
} from "@/providers/CurrentStateContext";
import {
  changeFieldvalue,
  changeWeightUnit,
  followUpReducer,
  generateRequestPayload,
  init,
  setCurrentStage,
  setHealthMatrices,
  setNextFollowUpDate,
  stage1Completed,
} from "@/config/state-reducers/follow-up";
import {
  calculateBMIFinal,
  calculateBMRFinal,
  calculateBodyAgeFinal,
  calculateBodyFatFinal,
  calculateIdealWeightFinal,
  calculateSMPFinal,
  calculateSubcutaneousFat,
} from "@/lib/client/statistics";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import HealthMetrics from "@/components/common/HealthMatrixPieCharts";
import { differenceInYears, parse } from "date-fns";
import { mutate } from "swr";
import { _throwError } from "@/lib/formatter";
import { extractNumber } from "@/lib/utils";

export default function FollowUpModal({ clientData }) {
  if (!clientData.healthMatrix) return <></>
  return <Dialog>
    <DialogTrigger className="w-full bg-[var(--accent-1)] text-[var(--primary-1)] text-[14px] font-semibold pr-3 py-2 flex items-center justify-center gap-2 rounded-[8px]">
      <CalendarRange className="w-[18px] h-[18px]" />
      Follow-up
    </DialogTrigger>
    <DialogContent className="!max-w-[650px] max-h-[70vh] border-b-1 p-0 gap-0 overflow-y-auto">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle className="text-[24px]">Follow Up</DialogTitle>
      </DialogHeader>
      <CurrentStateProvider
        state={init(clientData)}
        reducer={followUpReducer}
      >
        <FollowUpModalContainer clientData={clientData} clientId={clientData.clientId} />
      </CurrentStateProvider>
    </DialogContent>
  </Dialog>
}

function FollowUpModalContainer({ clientData }) {
  const { clientId, dob, healthMatrix: { height, heightUnit } } = clientData;
  const age = clientData.dob
    ? differenceInYears(new Date(), parse(clientData.dob, 'dd-MM-yyyy', new Date()))
    : 0
  const { stage } = useCurrentStateContext();
  if (stage === 1) return <Stage1 clientData={clientData} />;
  return <Stage2
    age={age}
    clientId={clientId}
    dob={dob}
    height={height}
    heightUnit={heightUnit}
  />;
}

function Stage1({ clientData }) {
  const { followUpType, healthMatrix, dispatch, ...state } = useCurrentStateContext();

  const latesthealthMatrix = clientData?.healthMatrix?.healthMatrix
    .at(clientData?.healthMatrix?.healthMatrix.length - 1);
  const latestOldWeight = `${extractNumber(latesthealthMatrix?.weight)} ${latesthealthMatrix?.weightUnit}`

  return <div className="p-4">
    <FormControl
      label="Date"
      type="date"
      className="block w-1/2 [&_.label]:font-[400] [&_.input]:text-[14px]"
      value={healthMatrix.date}
      onChange={e => dispatch(changeFieldvalue("date", e.target.value))}
    />
    {latestOldWeight && <h3 className="mt-4">Latest Old Weight {latestOldWeight}</h3>}
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div>
        <div className="pr-2 flex items-center gap-2 justify-between">
          <p>Current Weight</p>
          <RadioGroup value={healthMatrix.weightUnit} className="flex items-center gap-1">
            <input
              id="weight-kg"
              value="Kg"
              type="radio"
              className="w-[14px] h-[14px]"
              checked={healthMatrix.weightUnit === "Kg"}
              onChange={() => dispatch(changeWeightUnit("Kg"))}
            />
            <Label htmlFor="weight-kg" className="mr-3">Kg</Label>
            <input
              id="weight-pounds"
              value="Pounds"
              type="radio"
              checked={healthMatrix.weightUnit === "Pounds"}
              className="w-[14px] h-[14px]"
              onChange={() => dispatch(changeWeightUnit("Pounds"))}
            />
            <Label htmlFor="weight-pounds">Pounds</Label>
          </RadioGroup>
        </div>
        <WeightOfClient />
      </div>
      <FormControl
        label="Visceral Fat"
        type="number"
        placeholder="Visceral Fat"
        className="[&_.label]:font-[400] [&_.input]:text-[14px]"
        value={healthMatrix.visceral_fat}
        onChange={e => dispatch(changeFieldvalue("visceral_fat", e.target.value))}
      />
    </div>
    <SelectBodyComposition />
    <div className="mt-8 grid grid-cols-2 items-end gap-x-6">
      <div className="">
        <p>Follow Up Type</p>
        <RadioGroup value={healthMatrix.followUpType} className="mt-4 flex items-center gap-1">
          <input
            id="follow-up-8day"
            value="8day"
            type="radio"
            className="w-[14px] h-[14px]"
            checked={healthMatrix.followUpType === "8day"}
            onChange={() => dispatch(changeFieldvalue("followUpType", "8day"))}
          />
          <Label htmlFor="follow-up-8day" className="mr-3">8 Day</Label>
          <input
            id="follow-up-custom"
            value="custom"
            type="radio"
            checked={healthMatrix.followUpType === "custom"}
            className="w-[14px] h-[14px]"
            onChange={() => dispatch(changeFieldvalue("followUpType", "custom"))}
          />
          <Label htmlFor="follow-up-custom">Custom</Label>
        </RadioGroup>
      </div>
      {healthMatrix.followUpType === "custom" && <FormControl
        type="date"
        className="[&_.label]:font-[400] [&_.input]:text-[14px]"
        value={state.nextFollowUpDate}
        onChange={e => dispatch(setNextFollowUpDate(e.target.value))}
      />}
    </div>
    <Button
      onClick={() => {
        const completed = stage1Completed({ ...state, healthMatrix })
        if (!completed.success) toast.error(`Field ${completed.field} is required!`);
        else dispatch(setCurrentStage(2))
      }}
      variant="wz" className="block mx-auto mt-10 px-24">Continue</Button>
  </div>
}

function Stage2({
  age,
  height,
  heightUnit,
  clientId
}) {
  const { healthMatrix, dispatch, ...state } = useCurrentStateContext();

  const closeBtnRef = useRef();

  const payload = {
    ...healthMatrix,
    age,
    bodyComposition: healthMatrix.body_composition
  }
  const statObj = ["cms", "cm"].includes(heightUnit)
    ? {
      heightUnit,
      heightFeet: height.split(".")[0],
      heightInches: height.split(".")[1]
    }
    : {
      heightUnit,
      heightCms: height
    }

  const clienthealthStats = {
    bmi: calculateBMIFinal({ ...payload, ...statObj }),
    muscle: calculateSMPFinal({ ...payload, ...statObj }),
    fat: calculateBodyFatFinal({ ...payload, ...statObj }),
    rm: calculateBMRFinal({ ...payload, ...statObj }),
    idealWeight: calculateIdealWeightFinal({ ...payload, ...statObj }),
    bodyAge: calculateBodyAgeFinal({ ...payload, ...statObj }),
    sub_fat: calculateSubcutaneousFat(payload)?.subcutaneousPercent
  }

  async function createFollowUp() {
    try {
      const data = generateRequestPayload({ healthMatrix, ...state }, { ...payload, ...statObj })
      const response = await sendData(`app/add-followup?clientId=${clientId}`, data)
      if (response.status_code !== 200) _throwError(response.message || response.error);
      toast.success(response.message);
      mutate(`app/clientStatsCoach?clientId=${clientId}`)
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function onUpdateHealthMatrix(payload, fieldName, closeBtnRef) {
    dispatch(changeFieldvalue(fieldName, payload[fieldName]))
    closeBtnRef.current.click();
  }

  useEffect(function () {
    dispatch(setHealthMatrices(clienthealthStats));
  }, []);

  return (
    <div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-6">
          <HealthMetrics
            onUpdate={onUpdateHealthMatrix}
            data={payload}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-10">
          <Button
            onClick={() => dispatch(setCurrentStage(1))}
          >Previous</Button>
          <Button
            onClick={createFollowUp}
            variant="wz"
            className=""
          >
            Done
          </Button>
        </div>
        <DialogClose ref={closeBtnRef} />
      </div>
    </div>
  )
}

function SelectBodyComposition() {
  const { healthMatrix, dispatch } = useCurrentStateContext();

  return (
    <div className="mt-4 col-span-2">
      <span className="label font-[600] block mb-2">Body Composition</span>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        <div
          onClick={() => dispatch(changeFieldvalue("body_composition", "Slim"))}
          className={`border rounded p-3 text-center cursor-pointer w-24 ${healthMatrix.body_composition === "Slim" &&
            "border-[var(--accent-1)]"
            }`}
        >
          <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
            <Image src="/svgs/slim.svg" width={60} height={60} alt="Slim SVG" />
          </div>
          <p className="text-xs">Slim</p>
        </div>
        <div
          onClick={() =>
            dispatch(changeFieldvalue("body_composition", "Medium"))
          }
          className={`border rounded p-3 text-center cursor-pointer w-24 ${healthMatrix.body_composition === "Medium" &&
            "border-[var(--accent-1)]"
            }`}
        >
          <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
            <Image
              src="/svgs/medium.svg"
              width={50}
              height={60}
              alt="Medium SVG"
            />
          </div>
          <p className="text-xs">Medium</p>
        </div>

        {/* Fat */}
        <div
          onClick={() => dispatch(changeFieldvalue("body_composition", "Fat"))}
          className={`border rounded p-3 text-center cursor-pointer w-24 ${healthMatrix.body_composition === "Fat" &&
            "border-[var(--accent-1)]"
            }`}
        >
          <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
            <Image src="/svgs/fat.svg" width={150} height={150} alt="Fat SVG" />
          </div>
          <p className="text-xs">Fat</p>
        </div>
      </div>
    </div>
  );
}

function WeightOfClient() {
  const { dispatch, healthMatrix, ...state } = useCurrentStateContext();
  if (healthMatrix.weightUnit?.toLowerCase() === "kg") return <FormControl
    type="number"
    className="[&_.label]:font-[400] [&_.input]:text-[14px]"
    placeholder="Enter Weight"
    value={healthMatrix.weightInKgs}
    onChange={e => dispatch(changeFieldvalue("weightInKgs", e.target.value))}
  />

  return <FormControl
    type="number"
    className="[&_.label]:font-[400] [&_.input]:text-[14px]"
    placeholder="Enter Weight"
    value={healthMatrix.weightInPounds}
    onChange={e => dispatch(changeFieldvalue("weightInPounds", e.target.value))}
  />
}