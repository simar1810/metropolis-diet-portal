"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { retrieveReports } from "@/lib/fetchers/app";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials, trimString } from "@/lib/formatter";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, Upload, X } from "lucide-react";
import FormControl from "@/components/FormControl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [query, setQuery] = useState("");
  const { isLoading, error, data } = useSWR("clients/reports", () => retrieveReports());

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const allClients = data.data || [];

  const clients = allClients.filter(client => new RegExp(query, "i").test(client?.client?.name))

  return <div className="content-container content-height-screen">
    <div className="flex items-center justify-between">
      <h4 className="grow">Reports</h4>
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-40 md:min-w-sm bg-[var(--comp-1)]"
        placeholder="Search client name.."
      />
    </div>
    {clients.length === 0 && <>No reports uploaded</>}
    <Table className="mt-10 border-1">
      <TableHeader>
        <TableRow className="font-semibold">
          <TableHead className="w-[40px] text-center">Sr No.</TableHead>
          <TableHead className="w-[100px] text-center">Name</TableHead>
          <TableHead className="text-center">Email</TableHead>
          <TableHead className="text-center">Mobile Number</TableHead>
          <TableHead className="text-center">Client ID</TableHead>
          <TableHead className="text-center">Roll No</TableHead>
          <TableHead className="text-center">Uploaded Reports</TableHead>
          <TableHead className="text-center">Total</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client, index) => (<ClientDetails
          key={client._id}
          index={index}
          client={client}
        />))}
      </TableBody>
    </Table>
  </div>
}

function ClientDetails({ client, index }) {
  const reportNames = (client?.reports || []).map(report => report.title)?.join(", ")
  const router = useRouter();
  return <TableRow
    onClick={() => router.push(`/coach/clients/${client?.client?._id}?tab=client-reports`)}
    className="text-center cursor-pointer"
  >
    <TableCell>{index + 1}</TableCell>
    <TableCell className="font-medium flex items-center gap-1">
      <Avatar>
        <AvatarImage src={client?.client?.profilePhoto} />
        <AvatarFallback>{nameInitials(client?.client?.name)}</AvatarFallback>
      </Avatar>
      {client?.client?.name || <>-</>}
    </TableCell>
    <TableCell>{client?.client?.email || <>-</>}</TableCell>
    <TableCell>{client?.client?.mobileNumber || <>-</>}</TableCell>
    <TableCell>{client?.client?.clientId || <>-</>}</TableCell>
    <TableCell>{client?.client?.rollno || <>-</>}</TableCell>
    <TableCell>
      <Tooltip>
        <TooltipTrigger>
          {trimString(reportNames, 2)}
        </TooltipTrigger>
        <TooltipContent>{reportNames}</TooltipContent>
      </Tooltip>
    </TableCell>
    <TableCell>{client?.reports?.length || <>0</>}</TableCell>
    <TableCell>
      <UploadReport clientId={client?.client?._id} />
    </TableCell>
  </TableRow>
}

export function UploadReport({ clientId }) {
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState({
    title: "",
    description: "",
    file: ""
  })

  async function uploadReport() {
    try {
      setLoading(true);
      const formData = new FormData();
      for (const field of ["title", "description", "file"]) {
        formData.append(field, payload[field])
      }
      const response = await sendDataWithFormData(
        `app/reports/client?person=coach&clientId=${clientId}`,
        formData
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger>
      <Upload
        className="w-[16px] h-[16px] text-[var(--accent-1)]"
        strokeWidth={2.4}
      />
    </DialogTrigger>
    <DialogContent className="max-h-[75vh] p-0 gap-0 overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">Upload Report</DialogTitle>
      <div className="p-4">
        <FormControl
          label="Title"
          placeholder="Enter Title"
          value={payload.title}
          onChange={e => setPayload(prev => ({ ...prev, title: e.target.value }))}
        />
        <FormControl
          label="Description"
          placeholder="Enter Description"
          value={payload.description}
          onChange={e => setPayload(prev => ({ ...prev, description: e.target.value }))}
          className="block mt-4"
        />
        <FileUploadPreview
          payload={payload}
          setPayload={setPayload}
        />
        <Button
          variant="wz"
          className="block mt-4 mx-auto"
          disabled={loading}
          onClick={uploadReport}
        >
          Upload
        </Button>
      </div>
    </DialogContent>
  </Dialog>
}

function FileUploadPreview({
  payload,
  setPayload
}) {
  const [previewUrl, setPreviewUrl] = useState(null);

  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPayload((prev) => ({ ...prev, file }));

    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  return (
    <div className="py-4 relative">
      {payload.file && <X
        className="absolute top-4 right-4 cursor-pointer"
        onClick={() => {
          setPayload(prev => ({ ...prev, file: "" }))
          setPreviewUrl("")
        }}
      />}
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        ref={inputRef}
        hidden
      />

      {previewUrl && payload.file && (
        <div className="mt-4" onClick={() => inputRef.current.click()}>
          {payload.file.type.startsWith("image/") ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-full h-96 rounded-lg border"
            />
          ) : payload.file.type === "application/pdf" ? (
            <iframe
              src={previewUrl}
              title="PDF preview"
              className="w-full h-96 border rounded-lg"
            />
          ) : (
            <p>Unsupported file type</p>
          )}
        </div>
      )}
      {!previewUrl && <div
        onClick={() => inputRef.current.click()}
        className="w-full h-40 flex items-center justify-center border-1 border-black border-dashed rounded-[10px] cursor-pointer"
      >
        <Image />
      </div>}
    </div>
  );
}
