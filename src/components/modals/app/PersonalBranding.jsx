import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import FormControl from "@/components/FormControl";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { personalBrandingInitialState } from "@/config/state-data/personal-branding";
import {
  changeFieldvalue,
  generateRequestPayload,
  personalBrandingReducer,
  selectPersonalBrandToEdit
} from "@/config/state-reducers/personal-branding";
import { sendDataWithFormData } from "@/lib/api";
import { getPersonalBranding } from "@/lib/fetchers/app";
import { _throwError } from "@/lib/formatter";
import { getObjectUrl, normalizeHexColor } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { Pen, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export default function PersonalBranding({
  onClose
}) {
  return <Dialog
    open={true}
    onClose={onClose}
    onOpenChange={onClose}
  >
    <DialogTrigger />
    <DialogContent className="!max-w-[400px] w-full max-h-[70vh] border-0 p-0 overflow-y-auto">
      <DialogHeader className="bg-[var(--comp-1)] p-4 border-b-1">
        <DialogTitle className="">
          App Personalization
        </DialogTitle>
      </DialogHeader>
      <CurrentStateProvider
        state={personalBrandingInitialState}
        reducer={personalBrandingReducer}
      >
        <div className="pt-0 p-4">
          <PersonalBrandingContainer />
        </div>
      </CurrentStateProvider>
    </DialogContent>
  </Dialog>
}

function PersonalBrandingContainer({ onClose }) {
  const { stage } = useCurrentStateContext();
  if (stage === 1) return <Stage1 />
  if (stage === 2) return <Stage2 />
  return <Stage3 />
}

function Stage1() {
  const { isLoading, error, data, mutate } = useSWR("app/personalBranding", () => getPersonalBranding());
  const { dispatch } = useCurrentStateContext();
  const brands = data?.data;

  useEffect(function () {
    if (!error && data?.status_code === 200) dispatch(selectPersonalBrandToEdit(brands, mutate))
  }, [data, isLoading])

  if (isLoading) return <div className="h-[200px] flex items-center justify-center">
    <Loader />
  </div>

  if (error || data.status_code !== 200) return <ContentError className="border-0 min-h-auto h-[200px] mt-0" title={error || data.message} />
  return <>
    {brands.slice(0, 1).map(brand => <div
      key={brand._id}
      className="mb-4 px-4 py-2 flex items-center gap-2 border-2 border-[var(--accent-1)] rounded-[8px]"
    >
      <Avatar>
        <AvatarImage src={brand.brandLogo || "/not-found.png"} />
      </Avatar>
      <h3>{brand.brandName}</h3>
      <Pen
        onClick={() => dispatch(selectPersonalBrandToEdit(brand))}
        className="w-[16px] h-[16px] text-[var(--dark-1)]/25 hover:text-[var(--dark-1)] ml-auto cursor-pointer"
      />
    </div>)}
  </>
}

async function getRequestLink(data, type, id) {
  if (Boolean(type)) {
    const response = await sendDataWithFormData("app/update", data, "PUT");
    return response;
  } else {
    const response = await sendDataWithFormData("app/create", data);
    return response
  }
}

function Stage2() {
  const { selectedBrand, formData, dispatch } = useCurrentStateContext();
  const [loading, setLoading] = useState(false);
  const brandLogoRef = useRef();

  async function savePersonalBrandDetails() {
    try {
      setLoading(true);
      const data = generateRequestPayload(formData, selectedBrand._id);
      const response = await getRequestLink(data, selectedBrand._id);
      if (response.status_code !== 200) throw new Error(response.message);
      mutate("app/personalBranding");
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div>
    <FormControl
      label="Brand Name"
      placeholder="Company Name"
      value={formData.brandName}
      onChange={e => dispatch(changeFieldvalue("brandName", e.target.value))}
      className="block mb-4"
    />
    <div>
      <h3 className="mb-2">Brand Logo</h3>
      <SelectBrandLogo fieldName="file" brandLogoRef={brandLogoRef} />
      <input
        type="file"
        ref={brandLogoRef}
        onChange={e => dispatch(changeFieldvalue("brandLogo", e.target.files[0]))}
        hidden
      />
    </div>

    <h3 className="mt-4">Brand Colors</h3>
    <div className="p-2 mt-4 grid grid-cols-2 gap-2 border-1 rounded-[8px]">
      <div className="px-2 py-[2px] flex items-center justify-between border-2 rounded-[6px]">
        Color 1
        <input
          type="color"
          className="w-[32px] h-[32px] rounded-[4px]"
          value={normalizeHexColor(formData.primaryColor)}
          onChange={e => dispatch(changeFieldvalue("primaryColor", e.target.value.slice(1)))}
        />
      </div>
      <div className="px-2 py-[2px] flex items-center justify-between border-2 rounded-[6px]">
        Color 2
        <input
          type="color"
          className="w-[32px] h-[32px] rounded-[4px]"
          value={normalizeHexColor(formData.textColor)}
          onChange={e => dispatch(changeFieldvalue("textColor", e.target.value.slice(1)))}
        />
      </div>
    </div>

    <Button
      onClick={savePersonalBrandDetails}
      variant="wz"
      className="block mx-auto mt-8"
      disabled={loading}
    >
      Share Details
    </Button>
  </div>
}

function Stage3() {
  const { formData, dispatch } = useCurrentStateContext();
  const [loading, setLoading] = useState(false);
  const brandLogoRef = useRef();

  async function savePersonalBrandDetails() {
    try {
      setLoading(true);
      const data = generateRequestPayload(formData, formData._id);
      const response = await getRequestLink(data);
      if (response.status_code !== 200) throw new Error(response.message);
      mutate("app/personalBranding");
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div>
    <FormControl
      label="Brand Name"
      placeholder="Brand Name"
      value={formData.brandName}
      onChange={e => dispatch(changeFieldvalue("brandName", e.target.value))}
      className="block mb-4"
    />
    <div>
      <h3 className="mb-2">Brand Logo</h3>
      <SelectBrandLogo fieldName="file" brandLogoRef={brandLogoRef} />
      <input
        type="file"
        ref={brandLogoRef}
        onChange={e => dispatch(changeFieldvalue("brandLogo", e.target.files[0]))}
        hidden
      />
    </div>

    <h3 className="mt-4">Brand Colors</h3>
    <div className="p-2 mt-4 grid grid-cols-2 gap-2 border-1 rounded-[8px]">
      <div className="px-2 py-[2px] flex items-center justify-between border-2 rounded-[6px]">
        Color 1
        <input
          type="color"
          className="w-[32px] h-[32px] rounded-[4px]"
          value={normalizeHexColor(formData.primaryColor) || "#000000"}
          onChange={e => dispatch(changeFieldvalue("primaryColor", e.target.value.slice(1)))}
        />
      </div>
      <div className="px-2 py-[2px] flex items-center justify-between border-2 rounded-[6px]">
        Color 2
        <input
          type="color"
          className="w-[32px] h-[32px] rounded-[4px]"
          value={normalizeHexColor(formData.textColor) || "#000000"}
          onChange={e => dispatch(changeFieldvalue("textColor", e.target.value.slice(1)))}
        />
      </div>
    </div>

    <Button
      onClick={savePersonalBrandDetails}
      variant="wz"
      className="block mx-auto mt-8"
      disabled={loading}
    >
      Share Details
    </Button>
  </div>
}

function SelectBrandLogo({ brandLogoRef, fieldName }) {
  const { formData, selectedBrand, dispatch } = useCurrentStateContext();
  if (Boolean(formData["brandLogo"])) return <div className="relative">
    <Image
      src={getObjectUrl(formData["brandLogo"]) || "/not-found.png"}
      alt=""
      width={200}
      height={200}
      className="w-full max-h-[250px] object-contain"
      onClick={() => brandLogoRef.current.click()}
    />
    <X
      className="absolute top-2 right-2 cursor-pointer"
      onClick={e => dispatch(changeFieldvalue(["brandLogo"], undefined))}
    />
  </div>

  return <Image
    src={selectedBrand?.brandLogo || "/not-found.png"}
    alt=""
    height={200}
    width={200}
    className="w-full max-h-[250px] object-contain"
    onClick={() => brandLogoRef.current.click()}
  />
}