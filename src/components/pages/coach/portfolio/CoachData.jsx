import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import UpdateCoachAwardModal from "@/components/modals/coach/UpdateCoachAwardModal";
import UpdateCoachSocialsModal from "@/components/modals/coach/UpdateCoachSocialsModal";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import UploadImage from "@/components/modals/UploadImage";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coachPortfolioSocialLinks } from "@/config/data/ui";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { getCoachSocialLinks, retrieveBankDetails } from "@/lib/fetchers/app";
import { getObjectUrl } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { Link as LucideLink, Award, Users, X, Landmark, Banknote, Pen, Pencil, Dot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export default function CoachData({ awards }) {
  return <div className="bg-white p-4 rounded-[18px] border-1">
    <Tabs defaultValue="links">
      <Header />
      <CoachSMLinks />
      <CoachAwards awards={awards} />
      <CoachClubSettings />
      <BankDetails />
    </Tabs>
  </div>
}
const tabItems = [
  { icon: <LucideLink className="w-[16px] h-[16px]" />, value: "links", label: "Links" },
  { icon: <Award className="w-[16px] h-[16px]" />, value: "awards", label: "Awards" },
  { icon: <Users className="w-[16px] h-[16px]" />, value: "club", label: "Club" },
  { icon: <Landmark className="w-[16px] h-[16px]" />, value: "bank", label: "Bank" },
];

function Header() {
  const { organisation } = useAppSelector(state => state.coach.data);
  return <TabsList className="w-full h-auto bg-transparent p-0 mb-10 flex items-start gap-x-2 gap-y-3 flex-wrap rounded-none no-scrollbar">
    {tabItems.map(({ icon, value, label, showIf }) => {
      if (showIf && !showIf(organisation)) return null;
      return (
        <TabsTrigger
          key={value}
          className="min-w-[100px] mb-[-5px] px-2 font-semibold flex-1 basis-0 flex items-center gap-1 rounded-[10px] py-2
             data-[state=active]:bg-[var(--accent-1)] data-[state=active]:text-[var(--comp-1)]
             data-[state=active]:shadow-none text-[#808080] bg-[var(--comp-1)] border-1 border-[#EFEFEF]"
          value={value}
        >
          {icon}
          {label}
        </TabsTrigger>
      );
    })}
  </TabsList>
}

function CoachSMLinks() {
  const { isLoading, error, data } = useSWR("getCoachSocialLinks", () => getCoachSocialLinks());

  if (isLoading) return <TabsContent value="links">
    <ContentLoader />
  </TabsContent>

  if (error || data.status_code !== 200) return <TabsContent value="links">
    <p className="text-center mt-4">{error || data.message} </p>
    <UpdateCoachSocialsModal socialLinks={{}} />
  </TabsContent>

  const socialLinks = data.data;

  return <TabsContent value="links">
    <div>
      {coachPortfolioSocialLinks.map(social =>
        socialLinks[social.name]
        && <div
          key={social.id}
          className="px-4 mb-2 flex items-center gap-4"
        >
          {social.icon}
          <Link target="_blank" href={socialLinks[social.name]} className="w-full md:text-xs lg:text-base break-all">{socialLinks[social.name]}</Link>
        </div>)}
    </div>
    <UpdateCoachSocialsModal socialLinks={socialLinks} />
  </TabsContent>
}

function CoachAwards({ awards }) {
  return <TabsContent value="awards">
    <div className="flex items-center gap-2 justify-between">
      <h4>{awards.length} Awards Available</h4>
      <UpdateCoachAwardModal />
    </div>
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
      {awards.map(award => <div key={award._id} className="flex items-center gap-4 relative">
        <Image
          src={award.image || "/illustrations/award.png"}
          onError={e => e.target.src = "/illustrations/award.png"}
          alt=""
          height={64}
          width={64}
          className="w-[56px] h-[56px] object-contain rounded-full border-2 border-[var(--accent-1)]"
        />
        <p className="mr-auto">{award.title}</p>
        <DeleteAward awardId={award._id} />
      </div>)}
    </div>
    {awards.length === 0 && <div className="h-[200px] flex items-center justify-center">
      <UpdateCoachAwardModal />
    </div>
    }
  </TabsContent>
}

const clubFreeTrialSettings = [
  { id: 1, label: "Free Trial Days", name: "freeTrialVPDays" },
  { id: 2, label: "Roll Number Initials", name: "rollNumberInitials" },
]

const clubSubscriptionSettings = [
  { id: 1, label: "Free Trial Days", name: "freeTrialVPDays" },
  { id: 2, label: "Roll Number Initials", name: "rollNumberInitials" },
];

const clubVolumeSettings = [
  { id: 1, label: "Volume Point Deduction", name: "monthlyVpDeduction" },
  { id: 2, label: "No Of Free Trial Days", name: "freeTrialVPDays" },
  { id: 3, label: "Roll Number Initials", name: "rollNumberInitials" },
]


const ClubSettingsMap = new Map();
ClubSettingsMap.set(0, clubFreeTrialSettings);
ClubSettingsMap.set(1, clubSubscriptionSettings);
ClubSettingsMap.set(2, clubVolumeSettings);

function CoachClubSettings() {
  const [formData, setFormData] = useState({ file: undefined });
  const [loading, setLoading] = useState(false);

  const coach = useAppSelector(state => state.coach.data);
  const fields = ClubSettingsMap.get(coach.clubSystem);

  async function udpateDetails() {
    try {
      setLoading(true)
      const response = await sendData(`updateProfileDetails?id=${coach._id}`, formData, "PUT");
      if (!response.status) throw new Error(response.message);
      toast.success(response.message);
      mutate("coachProfile");
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    } finally {
      setLoading(false);
    }
  }

  return <TabsContent value="club">
    {fields.map(field => <FormControl
      key={field.id}
      defaultValue={coach[field.name] || ""}
      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
      placeholder="Please enter value"
      className="block mb-4"
      {...field}
    />)}
    <Button
      className="block mt-10 mx-auto"
      variant="wz"
      onClick={udpateDetails}
      disabled={loading}
    >
      Save
    </Button>
  </TabsContent>
}

function DeleteAward({ awardId }) {
  async function deleteNote(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData("app/coach/delete-award", { awardId }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="You are deleting an award. Are you sure?"
    action={(setLoading, btnRef) => deleteNote(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <X strokeWidth={3} className="w-[20px] h-[20px] text-white bg-[var(--accent-2)] p-[2px] rounded-[4px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}

function BankDetails() {
  const { isLoading, error, data } = useSWR("bank/details", () => retrieveBankDetails({ person: "coach" }));

  if (isLoading) return <TabsContent value="bank">
    <ContentLoader />
  </TabsContent>

  if (error || data.status_code !== 200) return <TabsContent value="bank">
    <ContentError title={error || data.message} />
  </TabsContent>
  const bank = data.data || {}
  return <TabsContent value="bank" className="space-y-4">
    <Card className="bg-[var(--comp-1)] w-full mx-auto shadow-none rounded-2xl relative">
      <UpdateBankDetails bank={bank} />
      <CardHeader className="flex flex-row items-center gap-4">
        <Image
          src={bank.qr}
          alt=""
          height={400}
          width={400}
          className="bg-white h-[200px] w-[200px] object-contain border-1 rounded-[16px] block mx-auto"
          onError={e => e.target.src = "/not-found.png"}
        />
      </CardHeader>

      <CardContent className="grid gap-3 text-sm">
        <div className="mb-4">
          <CardTitle className="text-lg leading-tight">{bank.accountName}</CardTitle>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{bank.bankName}</p>
            <Dot />
            <p className="text-sm text-muted-foreground">{bank.accountNumber}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Bank Branch:</span>
          <span>{bank.bankBranch}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">IFSC Code:</span>
          <span>{bank.ifscCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Account Holder:</span>
          <span>{bank.accountName}</span>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
}

function UpdateBankDetails({ bank }) {
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState({
    accountNumber: bank.accountNumber || "",
    accountName: bank.accountName || "",
    bankName: bank.bankName || "",
    bankBranch: bank.bankBranch || "",
    ifscCode: bank.ifscCode || "",
    file: ""
  })

  const fileRef = useRef();
  const closeBtnRef = useRef();

  async function saveBankDetails() {
    try {
      setLoading(true);
      const formData = new FormData();
      for (const field in payload) {
        if (Boolean(field)) formData.append(field, payload[field])
      }
      const response = await sendDataWithFormData("app/bank", formData);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("bank/details");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger>
      <Pencil
        // fill="#00984A"
        className="absolute w-[20px] h-[20px] text-[var(--accent-1)] top-4 right-4"
      />
    </DialogTrigger>
    <DialogContent className="p-0 max-h-[70vh] overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">Bank Details</DialogTitle>
      <div className="p-4 relative">
        <Image
          src={Boolean(payload.file) ? getObjectUrl(payload.file) : bank.qr || "/not-found.png"}
          height={400}
          width={400}
          className="w-full bg-[var(--comp-1)] max-h-[250px] object-contain rounded-[10px] border-1 mb-4"
          alt=""
          onClick={() => fileRef.current.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => setPayload(prev => ({ ...prev, file: e.target.files[0] }))}
        />
        {payload.file && <X
          className="absolute top-[24px] right-[24px] cursor-pointer"
          onClick={() => setPayload(prev => ({ ...prev, file: "" }))}
        />}
        <FormControl
          value={payload.accountNumber}
          onChange={e => setPayload(prev => ({ ...prev, accountNumber: e.target.value }))}
          placeholder="Account Number"
          label="Account Number"
          className="block mb-2"
        />
        <FormControl
          value={payload.accountName}
          onChange={e => setPayload(prev => ({ ...prev, accountName: e.target.value }))}
          label="Account Name"
          className="block mb-2"
        />
        <FormControl
          value={payload.bankName}
          onChange={e => setPayload(prev => ({ ...prev, bankName: e.target.value }))}
          label="Bank Name"
          className="block mb-2"
        />
        <FormControl
          value={payload.bankBranch}
          onChange={e => setPayload(prev => ({ ...prev, bankBranch: e.target.value }))}
          label="Bank Branch"
          className="block mb-2"
        />
        <FormControl
          value={payload.ifscCode}
          onChange={e => setPayload(prev => ({ ...prev, ifscCode: e.target.value }))}
          label="IFSC Code"
          className="block mb-2"
        />
        <Button
          className="max-w-xs w-full mt-8 mx-auto block"
          onClick={saveBankDetails}
          disabled={loading}
          variant="wz"
        >Save</Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}