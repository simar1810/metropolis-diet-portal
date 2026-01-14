"use client";
import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { getObjectUrl } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { Minus, PlusCircle, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import SelectMultiple from "@/components/SelectMultiple";
import { buildClickableUrl } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const { _id: coachId, client_categories, whitelabel = "wellnessz" } = useAppSelector(state => state.coach.data);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    isActive: true,
    coachId: coachId,
    file: "",
    availability: [],
    allowed_rollno_series: [],
    whitelabel
  })

  const fileRef = useRef();

  async function saveProgramDetails() {
    const toastId = toast.loading("Please wait...")
    try {
      setLoading(true);
      const data = new FormData();
      for (const field of ["name", "isActive", "coachId", "whitelabel"]) {
        if (!Boolean(formData[field])) throw new Error(`${field} is required!`);
        data.append(field, formData[field]);
      }
      data.append("link", buildClickableUrl(formData.link));
      data.append("file", await imageCompression(formData.file, { maxSizeMB: 0.25 }))
      data.append("person", "client")
      data.append("availability", JSON.stringify(formData.availability))
      for (const rollno of formData.allowed_rollno_series) {
        data.append("allowed_rollno_series", rollno)
      }
      const response = await sendDataWithFormData(`app/programs`, data);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      window.location.href = "/coach/tools/programs";
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      toast.dismiss(toastId)
    }
  }

  const availabilityOptions = [
    { id: 1, name: "All Client", value: "client" },
    ...client_categories.map((category, index) => ({
      id: index + 2,
      name: category.name,
      value: category.name
    }))
  ]

  return <div className="content-container">
    <div className="max-w-[650px] mx-auto">
      <h4 className="mb-6">Program Details</h4>
      <FormControl
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Program Title"
        className="block mb-4"
      />
      <FormControl
        value={formData.link}
        onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
        placeholder="Program Link"
        className="block mb-4"
      />
      <SelectMultiple
        options={availabilityOptions}
        value={formData.availability}
        onChange={value => setFormData(prev => ({ ...prev, availability: value }))}
        className="mb-4"
      />
      <UpdateAllowedRollnos
        rollnos={formData.allowed_rollno_series}
        onChange={value => setFormData(prev => ({
          ...prev,
          allowed_rollno_series: value
        }))}
      />
      {formData.file
        ? <div className="relative">
          <Image
            alt=""
            src={getObjectUrl(formData.file) || "/not-found.png"}
            onError={e => e.target.src = "/not-fonud.png"}
            height={550}
            width={550}
            className="w-full h-[200px] object-contain object-center"
            onClick={() => fileRef.current.click()}
          />
          <X
            className="absolute top-4 right-4 opacity-70 cursor-pointer"
            onClick={() => setFormData(prev => ({ ...prev, file: "" }))}
          />
        </div>
        : <div onClick={() => fileRef.current.click()} className="h-[200px] flex items-center justify-center border-1 border-gray-300 rounded-[8px] cursor-pointer">
          <PlusCircle className="text-[var(--accent-1)]" />
        </div>}
      <FormControl
        type="file"
        hidden
        ref={fileRef}
        onChange={e => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
      />
      <Button
        disabled={loading}
        className="mx-auto block mt-6"
        variant="wz"
        onClick={saveProgramDetails}
      >
        Save
      </Button>
    </div>
  </div>
}

export function UpdateAllowedRollnos({ rollnos, onChange }) {
  const [newRollnos, setNewRollnos] = useState("")
  const allSeries = rollnos || []
  return <div className="mb-4">
    <div className="mb-2 flex items-end gap-4">
      <FormControl
        className="text-[14px] [&_.label]:font-[400] block grow"
        value={newRollnos}
        onChange={e => setNewRollnos(e.target.value)}
        placeholder="Allowed roll no Series."
      />
      {newRollnos && <Button
        variant="wz"
        onClick={() => {
          if (allSeries.includes(newRollnos.trim())) {
            toast.error("Roll no series already added");
            return
          }
          onChange([...allSeries, newRollnos.trim().toLocaleLowerCase()]);
          setNewRollnos("")
        }}
      >
        Save
      </Button>}
    </div>
    <div className="flex flex-wrap gap-2">
      {allSeries.map(roll => <div
        key={roll}
        className="relative"
      >
        <Badge>
          {roll}
        </Badge>
        <Minus
          className="text-white bg-[var(--accent-2)] absolute top-0 right-[-8px] translate-y-[-20%]
                      w-[16px] h-[16px] cursor-pointer z-[100] rounded-full"
          strokeWidth={3}
          onClick={() => onChange(allSeries.filter(item => item !== roll)
          )}
        />
      </div>)}
    </div>
  </div>
}