import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { Button } from "@/components/ui/button";
import { Forward } from "lucide-react";
import useSWR from "swr";
import { getClubClientVolumePoints } from "@/lib/fetchers/club";
import { copyText } from "@/lib/utils";
import { toast } from "sonner";
import ClientListVolumePoint from "./ClientListVolumePoint";
import RequestedVPModal from "@/components/modals/club/RequestedVPModal";
import FormControl from "@/components/FormControl";
import { useState } from "react";

function sortClients(clients = [], query) {
  return clients
    .sort((clientA, clientB) => Number(clientA.activePoints) - Number(clientB.activePoints))
    .filter(client => !!client.clientId)
    .filter(client => new RegExp(query, "i").test(client?.clientId?.name));
}

export default function VolumePointModeClientsList() {
  const [query, setQuery] = useState("")
  const { isLoading, error, data } = useSWR(`membership`, getClubClientVolumePoints);

  if (isLoading) return <ContentLoader />

  if (data.status_code !== 200 || error) return <ContentError title={error || data.message} />

  const clients = sortClients(data.data, query)

  if (clients.length === 0) return <div className="content-container">
    <Header query={query} setQuery={setQuery} />
    <ContentError
      title="0 clients found!"
      className="mt-0 border-0"
    />
  </div>
  return <div className="content-container">
    <Header query={query} setQuery={setQuery} />
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 divide-y-1">
      {clients.map((client, index) => <ClientListVolumePoint
        key={index}
        client={client.clientId || {}}
        activePoints={client.activePoints}
      />)}
    </div>
  </div>
}

function Header({ query, setQuery }) {
  function copyLink() {
    copyText(process.env.NEXT_PUBLIC_CLIENT_ENDPOINT + "/request-volume-point")
    toast.success("Link Copied")
  }

  return <div className="pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2 border-b-1">
    <h4>Volume Point</h4>
    <div className="flex items-center justify-start gap-2 md:gap-6">
    <FormControl
      className="ml-auto"
      placeholder="Search by name.."
      query={query}
      onChange={e => setQuery(e.target.value)}
    />
    <Button
      size="sm"
      variant="wz_outline"
      onClick={copyLink}
    >
      <Forward className="w-[16px]" />
      <span className="text-xs md:text-sm">Volume Point Form</span>
    </Button>
      <RequestedVPModal />
    </div>
  </div>
}