import FormControl from "@/components/FormControl";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { changeFieldvalue, changeHeightUnit, changeWeightUnit, setCurrentStage, stage1Completed } from "@/config/state-reducers/add-client-checkup";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { differenceInYears, format, isAfter, parse } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

export default function CheckupStage1() {
  const { dispatch, ...state } = useCurrentStateContext();
  return <div className="py-6 pt-4">
    <div className="flex flex-col items-start md:flex-row md:items-center gap-6 mb-6">
      <p className="font-semibold text-sm">Select Customer type</p>
      <div className="flex items-center gap-4">
        <RadioGroup
          className="flex items-center gap-4"
          value={state.clientType}
          onValueChange={(value) => dispatch(changeFieldvalue("clientType", value))}
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="new" id="r1" className={state.clientType === "new" && "bg-[var(--accent-1)]"} />
            <Label className="text-[16px]" htmlFor="r1">New</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="existing" id="r2" className={state.clientType === "existing" && "bg-[var(--accent-1)]"} />
            <Label className="text-[16px]" htmlFor="r2">Existing</Label>
          </div>
        </RadioGroup>
      </div>
      <p className="md:ml-auto">Client ID - <strong>{state.clientId}</strong></p>
    </div>

    {/* Form Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-6 mb-4">

      <FormControl
        label="Client Name"
        type="text"
        placeholder="Enter Name"
        value={state.name}
        onChange={(e) =>
          dispatch(changeFieldvalue("name", e.target.value))
        }
      />

      <FormControl
        label="DOB (mandatory or 01/01/2000)"
        type="date"
        placeholder="DD/MM/YYYY"
        className="w-full"
        value={state.dob}
        onChange={(e) => {
          const value = e.target.value;
          const parsedDate = value
            ? parse(value, "yyyy-MM-dd", new Date())
            : null;

          if (parsedDate && isNaN(parsedDate)) {
            toast.error("Please enter a valid date of birth");
            return;
          }

          if (parsedDate && isAfter(parsedDate, new Date())) {
            toast.error("Date of birth cannot be in the future");
            return;
          }

          dispatch(changeFieldvalue("dob", value));
          dispatch(
            changeFieldvalue(
              "age",
              value ? differenceInYears(new Date(), parsedDate) : ""
            )
          );
        }}
      />

      {/* Gender */}
      <div>
        <span className="label font-[600] block mb-1">Gender</span>
        <div className="flex gap-4">
          <button
            onClick={() => dispatch(changeFieldvalue("gender", "male"))}
            className={`flex-1 p-3 border rounded-[8px] border-[#D6D6D6] text-sm ${
              state.gender === "male" &&
              "border-[var(--accent-1)] text-[var(--accent-1)]"
            }`}
          >
            ♂ Male
          </button>
          <button
            onClick={() => dispatch(changeFieldvalue("gender", "female"))}
            className={`flex-1 p-3 border rounded-[8px] border-[#D6D6D6] text-sm ${
              state.gender === "female" &&
              "border-[var(--accent-1)] text-[var(--accent-1)]"
            }`}
          >
            ♀ Female
          </button>
        </div>
      </div>

      {/* Date of joining */}
      <FormControl
        label="Date of Joining"
        type="date"
        onChange={(e) =>
          state.clientType !== "new"
            ? dispatch(changeFieldvalue("joiningDate", e.target.value))
            : {}
        }
        value={
          state.clientType === "new"
            ? format(new Date(), "yyyy-MM-dd")
            : state.joiningDate
        }
      />

      {/* Height */}
      <div>
        <div className="flex items-center justify-between">
          <div className="label font-[600] block mb-1">Height</div>
          <div className="flex items-center gap-4 text-sm mb-2">
            <label className="flex items-center gap-1">
              <input
                onChange={() => dispatch(changeHeightUnit("Inches"))}
                checked={state.heightUnit === "Inches"}
                type="radio"
              />
              Ft In
            </label>
            <label className="flex items-center gap-1">
              <input
                onChange={() => dispatch(changeHeightUnit("Cms"))}
                checked={state.heightUnit === "Cms"}
                type="radio"
              />
              CM
            </label>
          </div>
        </div>
        <Selectheight />
      </div>

      {/* Weight */}
      <div>
        <div className="flex items-center justify-between">
          <div className="label font-[600] block mb-1">Weight</div>
          <div className="flex gap-3 text-sm mb-2">
            <label className="flex items-center gap-1">
              <input
                onChange={() => dispatch(changeWeightUnit("Kg"))}
                checked={state.weightUnit === "Kg"}
                type="radio"
              />
              Kg
            </label>
            <label className="flex items-center gap-1">
              <input
                onChange={() => dispatch(changeWeightUnit("Pounds"))}
                checked={state.weightUnit === "Pounds"}
                type="radio"
              />
              Lbs
            </label>
          </div>
        </div>
        <SelectWeightUnit />
      </div>

      {/* VF & Age */}
      <FormControl
        label="Visceral Fat (optional)"
        type="text"
        placeholder="Enter Visceral Fat"
        value={state.visceral_fat}
        onChange={(e) =>
          dispatch(changeFieldvalue("visceral_fat", e.target.value))
        }
      />

      <FormControl
        label="Age"
        type="number"
        placeholder="Enter Age"
        value={state.age}
        onChange={(e) =>
          dispatch(changeFieldvalue("age", e.target.value))
        }
      />

      {/* Body Composition */}
      <div className="col-span-1 sm:col-span-2">
        <span className="label font-[600] block mb-2">Body Composition</span>

        <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
          <div
            onClick={() => dispatch(changeFieldvalue("bodyComposition", "Slim"))}
            className={`border rounded p-3 text-center cursor-pointer min-w-[100px] ${
              state.bodyComposition === "Slim" && "border-[var(--accent-1)]"
            }`}
          >
            <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
              <Image src="/svgs/slim.svg" width={60} height={60} alt="Slim" />
            </div>
            <p className="text-xs">Slim</p>
          </div>

          <div
            onClick={() => dispatch(changeFieldvalue("bodyComposition", "Medium"))}
            className={`border rounded p-3 text-center cursor-pointer min-w-[100px] ${
              state.bodyComposition === "Medium" && "border-[var(--accent-1)]"
            }`}
          >
            <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
              <Image src="/svgs/medium.svg" width={60} height={60} alt="Medium" />
            </div>
            <p className="text-xs">Medium</p>
          </div>

          <div
            onClick={() => dispatch(changeFieldvalue("bodyComposition", "Fat"))}
            className={`border rounded p-3 text-center cursor-pointer min-w-[100px] ${
              state.bodyComposition === "Fat" && "border-[var(--accent-1)]"
            }`}
          >
            <div className="w-[83px] h-[106px] mx-auto mb-1 flex items-center justify-center overflow-hidden">
              <Image src="/svgs/fat.svg" width={80} height={80} alt="Fat" />
            </div>
            <p className="text-xs">Fat</p>
          </div>
        </div>
      </div>
    </div>

    <button
      onClick={() => {
        const completed = stage1Completed(state, "stage1");
        if (!completed.success)
          toast.error("Please fill the field - " + completed.field);
        else dispatch(setCurrentStage(2));
      }}
      className="bg-[var(--accent-1)] text-white font-bold w-full text-center px-4 py-3 rounded-[4px] mt-6"
    >
      Next
    </button>
  </div>

}

function Selectheight({
  onChangeCms,
  onChangeFeet,
  onChangeInches
}) {
  const { heightCms, heightFeet, heightInches, dispatch, heightUnit } = useCurrentStateContext();

  if (heightUnit.toLowerCase() === "cms") return <div className="flex">
    <FormControl
      label="Cm"
      value={heightCms}
      placeholder="Cm"
      onChange={(e) => dispatch(changeFieldvalue("heightCms", e.target.value))}
      type="number"
      className="grow mt-1 [&_.label]:font-[400] [&_.label]:text-[14px]"
    />
  </div>
  return <div className="mt-1 flex gap-2">
    <FormControl
      value={heightFeet}
      label="Ft"
      onChange={(e) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= 12) {
          dispatch(changeFieldvalue("heightFeet", value));
        } else {
          toast.error("Inches should be between 0 and 12");
        }
      }}
      placeholder="Ft"
      className="w-full [&_.label]:font-[400] [&_.label]:text-[14px]"
      type="number"
    />
    <FormControl
      value={heightInches}
      label="Inch"
      onChange={(e) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= 12) {
          dispatch(changeFieldvalue("heightInches", value));
        } else {
          toast.error("Inches should be between 0 and 12");
        }
      }}
      placeholder="In"
      className="w-full [&_.label]:font-[400] [&_.label]:text-[14px]"
      type="number"
    />
  </div>
}

function SelectWeightUnit() {
  const { weightInKgs, weightInPounds, weightUnit, dispatch } = useCurrentStateContext();

  if (weightUnit?.toLowerCase() === "kg") return <FormControl
    label="Kg"
    placeholder="Enter weight"
    value={weightInKgs}
    onChange={e => dispatch(changeFieldvalue("weightInKgs", e.target.value))}
    type="number"
    className="[&_.label]:font-[400] [&_.label]:text-[14px]"
  />
  return <FormControl
    label="Pounds"
    placeholder="Enter weight"
    value={weightInPounds}
    onChange={e => dispatch(changeFieldvalue("weightInPounds", e.target.value))}
    type="number"
    className="[&_.label]:font-[400] [&_.label]:text-[14px]"
  />
}