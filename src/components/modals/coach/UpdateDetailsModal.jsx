import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import FormControl from "@/components/FormControl";
import SelectControl from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { coachDetailsFields } from "@/config/data/ui";
import { sendDataWithFormData } from "@/lib/api";
import { getOrganisation } from "@/lib/fetchers/app";
import { getObjectUrl } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

const formFields = ["name", "email", "mobileNumber", "file", "organisation"];

export default function UpdatePersonalDetails({ coachData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => generateDefaultPayload(coachData));
  const _id = useAppSelector(state => state.coach.data._id);

  const closeBtnRef = useRef();
  const fileRef = useRef();

  async function updateCoachDetails() {
    try {
      const data = new FormData();
      for (const field of formFields) {
        data.append(field, formData[field])
      }
      const response = await sendDataWithFormData(`app/updateCoach?id=${_id}`, data, "PUT");
      if (!response.data) throw new Error(response.message);
      toast.success(response.message);
      mutate("coachProfile");
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
          profilePhoto={coachData.profilePhoto}
        />
        <div className="text-left mt-8 grid grid-cols-2 gap-x-4 gap-y-2 [&_.label]:font-[500] text-[14px]">
          {coachDetailsFields.map(field => <FormControl
            key={field.id}
            value={formData[field.name]}
            onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
            label={field.label}
            placeholder={"Please enter the value."}
          />)}
          <SelectOrganisation
            value={formData.organisation}
            onChange={e => setFormData(prev => ({ ...prev, organisation: e.target.value }))}
          />
        </div>
        <Button
          variant="wz"
          onClick={updateCoachDetails}
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
        src={getObjectUrl(value) || profilePhoto || "/"}
        alt=""
        height={200}
        width={200}
        onClick={() => fileRef.current.click()}
        className="max-w-[100px] w-full bg-[var(--comp-3)] rounded-full border-[var(--accent-1)] object-contain aspect-square"
      />
      : <div
        onClick={() => fileRef.current.click()}
        className="max-w-[100px] w-full bg-[var(--comp-3)] rounded-full border-[var(--accent-1)] aspect-square"
      />}
  </>
}

export function SelectOrganisation({ value, onChange }) {
  const { isLoading, error, data } = useSWR("getOrganisation", () => getOrganisation());

  if (isLoading) return <Loader />

  if (data.status_code !== 200 || error) return <ContentError className="mt-0 p-0 text-[12px] !min-h-auto border-0 text-[var(--accent-2)]" title={error || data.message} />

  const organisations = data.data;

  return <SelectControl
    onChange={onChange}
    options={generateOrgsPayload(organisations)}
    value={value}
    label={"Organisation"}
  />
}

function generateDefaultPayload(obj) {
  const payload = {};
  for (const field of formFields) {
    payload[field] = obj[field];
  }
  return payload;
}

function generateOrgsPayload(orgs) {
  const options = [{ id: -1, value: "", name: "Select An Organisation" }];
  for (const [index, org] of orgs.entries()) {
    options.push({ id: index, value: org.organisation, name: org.organisation });
  }
  return options;
}