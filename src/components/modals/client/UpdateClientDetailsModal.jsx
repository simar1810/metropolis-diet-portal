import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { clientDetailsFields } from "@/config/data/ui";
import { sendDataWithFormData } from "@/lib/api";
import { getObjectUrl } from "@/lib/utils";
import { format, parse } from "date-fns";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { CookingPot, Image as ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch";
import { _throwError } from "@/lib/formatter";
import { calculateBMIFinal, calculateIdealWeightFinal } from "@/lib/client/statistics";

const formFields = ["name", "email", "mobileNumber", "age", "gender", "file", "heightUnit"];

function getHeight(formData) {
  if (formData.heightUnit.toLowerCase() === "cm") {
    return formData["heightCms"];
  } else {
    return `${formData["heightFeet"]}.${formData["heightInches"]}`;
  }
}

function getWeight(formData) {
  if (formData.weightUnit?.toLowerCase() === "kg") {
    return formData["weightInKgs"];
  } else {
    return formData["weightInPounds"];
  }
}

function generateDefaultPayload(obj) {
  const payload = {};
  for (const field of formFields) {
    payload[field] = obj[field] || "";
  }
  const healthMatrix = obj.healthMatrix
  if (healthMatrix) {
    payload.heightUnit = healthMatrix.heightUnit
    payload.heightCms = ["cm", "cms"].includes(healthMatrix.heightUnit?.toLowerCase())
      ? healthMatrix.height
      : ""
    payload.heightFeet = ["inches"].includes(healthMatrix.heightUnit?.toLowerCase())
      ? healthMatrix.height.split(".")[0] || "0"
      : ""
    payload.heightInches = ["inches"].includes(healthMatrix.heightUnit?.toLowerCase())
      ? healthMatrix.height.split(".")[1] || "0"
      : ""

    payload.weightUnit = healthMatrix.weightUnit
    payload.weightInKgs = ["kg", "kgs"].includes(healthMatrix.weightUnit?.toLowerCase())
      ? healthMatrix.weight
      : ""
    payload.weightInPounds = ["pound", "pounds"].includes(healthMatrix.heightUnit?.toLowerCase())
      ? healthMatrix.weight
      : ""
  }

  if (!payload.heightUnit) payload.heightUnit = "inches"
  if (!payload.weightUnit) payload.weightUnit = "kg"

  if (obj.dob && obj.dob.split("-")[0].length === 2) {
    payload.dob = format(parse(obj.dob, 'dd-MM-yyyy', new Date()), "yyyy-MM-dd");
  } else {
    payload.dob = obj.dob
  }
  return payload;
}

export default function UpdateClientDetailsModal({ clientData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => generateDefaultPayload(clientData));
  const closeBtnRef = useRef();
  const fileRef = useRef();

  async function updateClientDetails() {
    try {
      const data = new FormData();
      if (formData.heightUnit === "Cms") {
        data.append("height", formData.heightCms)
      } else {
        data.append("height", `${formData.heightFeet}.${formData.heightInches}`)
      }
      // data.append("weight", getWeight(formData))
      for (const field of formFields) {
        data.append(field, formData[field])
      }
      data.append("dob", format(parse(formData.dob, 'yyyy-MM-dd', new Date()), "dd-MM-yyyy"));
      data.append(
        "bmi",
        calculateBMIFinal(formData) ||
        clientData?.healthMatrix?.healthMatrix?.at(0)?.bmi || 0
      )
      data.append("idealWeight", calculateIdealWeightFinal(formData))
      const response = await sendDataWithFormData(`app/updateClient?id=${clientData._id}`, data, "PUT");
      if (!response.data) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/${clientData._id}`);
      mutate(`app/clientStatsCoach?clientId=/${clientData._id}`);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="text-[var(--accent-1)] text-[14px] font-semibold pr-3">
      Edit
    </DialogTrigger>
    <DialogContent className="!max-w-[650px] text-center border-0 px-4 lg:px-10 overflow-auto gap-0">
      <DialogTitle>Personal Information</DialogTitle>
      <div className="mt-4">
        <ProfilePhoto
          fileRef={fileRef}
          value={formData.file}
          setFormData={setFormData}
          profilePhoto={clientData.profilePhoto}
        />
        <div className="text-left mt-8 grid grid-cols-2 gap-x-4 gap-y-2 [&_.label]:font-[500] text-[14px]">
          {clientDetailsFields.map(field => <Component
            key={field.id}
            field={field}
            formData={formData}
            setFormData={setFormData}
          />)}
        </div>
        <Button
          variant="wz"
          onClick={updateClientDetails}
          disabled={loading}
          className="mt-8"
        >
          Save details
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}

function ProfilePhoto({ profilePhoto, value, fileRef, setFormData }) {
  return <>
    <input
      type="file"
      className="hidden"
      ref={fileRef}
      onChange={e => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
    />
    {value || profilePhoto
      ? <Image
        src={getObjectUrl(value) || profilePhoto || "/not-found.png"}
        alt=""
        height={200}
        width={200}
        onClick={() => fileRef.current.click()}
        className="max-w-[100px] w-full bg-[var(--comp-3)] rounded-full border-[var(--accent-1)] object-contain aspect-square"
      />
      : <div
        onClick={() => fileRef.current.click()}
        className="max-w-[100px] w-full bg-[var(--comp-3)] flex items-center justify-center rounded-full border-[var(--accent-1)] aspect-square"
      >
        <ImageIcon className="w-[20px] h-[20px]" />
      </div>}
  </>
}

function Component({ field, formData, setFormData }) {
  switch (field.type) {
    case 2:
      return <SelectHeight
        key={field.id}
        formData={formData}
        setFormData={setFormData}
      />;
    case 3:
      return <SelectWeightUnit
        key={field.id}
        formData={formData}
        setFormData={setFormData}
        weight={formData.weight}
        weightUnit={formData.weightUnit}
      />;
    case 4:
      return <SelectControl
        key={field.id}
        value={formData[field.name]}
        onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
        {...field}
      />;
    default:
      return <FormControl
        key={field.id}
        value={formData[field.name]}
        onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
        label={field.label}
        placeholder={"Please enter the value."}
        {...field}
      />;
  }
}

function SelectHeight({ formData, setFormData }) {
  const { heightCms, heightFeet, heightInches, heightUnit } = formData;

  function changeFieldvalue(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function onChangeHeightUnit() {
    setFormData(prev => ({
      ...prev,
      heightUnit: heightUnit === "inches" ? "Cms" : "inches",
      heightCms: formData.heightUnit?.toLowerCase() === "Cms"
        ? formData.heightCms
        : Math.floor(((formData.heightFeet * 30.48) + (formData.heightInches * 2.54))),
      heightFeet: formData.heightUnit?.toLowerCase() === "inches"
        ? formData.heightFeet
        : Math.floor(Number(formData.heightCms) / 30.48),
      heightInches: formData.heightUnit?.toLowerCase() === "inches"
        ? formData.heightInches
        : Math.round(((Number(formData.heightCms) / 30.48) % 1) * 12)
    }))
  }

  if (heightUnit.toLowerCase() === "cms") return <div className="mt-1">
    <div className="flex items-center gap-2">
      <h5 className="mr-auto">Height <span className="!font-[300]">{"(Cm)"}</span></h5>
      <p>Ft/In</p>
      <Switch
        checked={["cm", "cms"].includes(formData.heightUnit.toLowerCase())}
        onCheckedChange={onChangeHeightUnit}
      />
      <p>Cm</p>
    </div>
    <FormControl
      value={heightCms}
      placeholder="Cm"
      onChange={(e) => changeFieldvalue("heightCms", e.target.value)}
      type="number"
      className="grow mt-1 [&_.label]:font-[400] [&_.label]:text-[14px]"
    />
  </div>
  return <div className="mt-1">
    <div className="flex items-center gap-2">
      <h5 className="mr-auto">Height <span className="!font-[300]">{"(Ft/In)"}</span></h5>
      <p>Ft/In</p>
      <Switch
        checked={["cm", "cms"].includes(formData.heightUnit.toLowerCase())}
        onCheckedChange={onChangeHeightUnit}
      />
      <p>Cm</p>
    </div>
    <div className="flex gap-2">
      <FormControl
        value={heightFeet}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value >= 0 && value <= 12) {
            changeFieldvalue("heightFeet", value);
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
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value >= 0 && value <= 12) {
            changeFieldvalue("heightInches", value);
          } else {
            toast.error("Inches should be between 0 and 12");
          }
        }}
        placeholder="In"
        className="w-full [&_.label]:font-[400] [&_.label]:text-[14px]"
        type="number"
      />
    </div>
  </div>
}

function SelectWeightUnit({ formData, setFormData }) {
  function changeFieldvalue(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function onChangeWeightUnit() {
    setFormData(prev => ({
      ...prev,
      weightUnit: formData.weightUnit === "kg" ? "pounds" : "kg",
      weightInKgs: formData.weightUnit?.toLowerCase() === "pounds"
        ? Math.round(formData.weightInPounds / 2.20462)
        : formData.weightInKgs,
      weightInPounds: formData.weightUnit?.toLowerCase() === "kg"
        ? Math.round(formData.weightInKgs * 2.20462)
        : formData.weightInPounds,
    }))
  }

  if (formData.weightUnit?.toLowerCase() === "kg") return <div className="mt-1">
    <div className="flex items-center gap-2">
      <h5 className="mr-auto">Weight <span className="!font-[300]">{"(Kg/Lbs)"}</span></h5>
      <p>Pound</p>
      <Switch
        checked={["kg", "kgs"].includes(formData.weightUnit?.toLowerCase())}
        onCheckedChange={onChangeWeightUnit}
      />
      <p>Kg</p>
    </div>
    <FormControl
      placeholder="Enter weight"
      value={formData.weightInKgs}
      onChange={e => changeFieldvalue("weightInKgs", e.target.value)}
      type="number"
      className="[&_.label]:font-[400] [&_.label]:text-[14px]"
    />
  </div>
  return <div className="mt-1">
    <div className="flex items-center gap-2">
      <h5 className="mr-auto">Weight <span className="!font-[300]">{"(Kg/Lbs)"}</span></h5>
      <p>Pound</p>
      <Switch
        checked={["kg", "kgs"].includes(formData.weightUnit?.toLowerCase())}
        onCheckedChange={onChangeWeightUnit}
      />
      <p>Kg</p>
    </div>
    <FormControl
      placeholder="Enter weight"
      value={formData.weightInPounds}
      onChange={e => changeFieldvalue("weightInPounds", e.target.value)}
      type="number"
      className="[&_.label]:font-[400] [&_.label]:text-[14px]"
    />
  </div>
}