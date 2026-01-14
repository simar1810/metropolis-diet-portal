'use client';
import Image from "next/image";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { getMarathonLeaderBoard, getMarathons } from "@/lib/fetchers/app";
import useSWR, { mutate, useSWRConfig } from "swr";
import FormControl from "@/components/FormControl";
import { ArrowLeft, Eye, Trash2, ListFilterPlus, Plus, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { useState } from "react";
import AssignMarathonModal from "@/components/modals/app/AssignMarathonModal";
import CreateMarathonModal, { DeleteMarathonTasks } from "@/components/modals/app/CreateMarathonModal";
import { DialogTrigger } from "@/components/ui/dialog";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateMarathonTaskModal from "@/components/modals/tools/CreateMarathonTaskModal";

export default function Page() {
  const { isLoading, error, data } = useSWR("app/getMarathons", getMarathons);
  const [selectedMarathonId, setSelectedMarathonId] = useState("");

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const marathons = data.data;

  return <div className="">
    {!Boolean(selectedMarathonId) && <ListMarathons
      setSelectedMarathonId={setSelectedMarathonId}
      marathons={marathons}
    />}
    <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-2 md:gap-4">
      <SelectedMarathonDetails
      setSelectedMarathonId={setSelectedMarathonId}
      marathon={marathons.find(marathon => marathon._id === selectedMarathonId)}
      />
      {selectedMarathonId && < MarathonLeaderBoard
      marathon={marathons.find(marathon => marathon._id === selectedMarathonId)}
      marathonId={selectedMarathonId}
      />}
    </div>
  </div>
}

function ListMarathons({ marathons, setSelectedMarathonId }) {
  const [searchQuery, setSearchQuery] = useState("");

  const marathonsToDisplay = marathons.filter((marathon) =>
    marathon.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="content-container space-y-4 md:space-y-2">
      <div className="">
        <h1 className="text-xl text-gray-700 mb-4">Marathons</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <p className="text-sm md:text-base font-semibold bg-gray-50 text-gray-500 mr-auto px-4 py-2 rounded-lg italic">
          {marathons.length} Marathons
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <ListFilterPlus size={25} className="text-gray-400" />

            <FormControl
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search marathons..."
              className="[&_.input]:text-[14px] [&_.input]:bg-[var(--comp-1)]"
            />
          </div>

          <DeleteMarathonTasks marathons={marathons} />
          <CreateMarathonModal />
          <CreateMarathonTaskModal />
        </div>
      </div>

      <div className="rounded-xl w-auto  overflow-x-auto no-scrollbar shadow bg-white border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Marathon Name</th>
              <th className="py-3 px-4 text-left">Assigned Clients</th>
              <th className="py-3 px-4 text-right">Assign Clients</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {marathonsToDisplay.length === 0 ? (
              <tr>
                <td colSpan="3">
                  <ContentError
                    className="border-0 py-6"
                    title="No marathons found for this search query!"
                  />
                </td>
              </tr>
            ) : (
              marathonsToDisplay.map((marathon) => {
                const clients = marathon.clients || [];
                const visibleClients = clients.slice(0, 2);
                const extraCount = clients.length - 2;

                return (
                  <tr
                    key={marathon._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <h5 className="text-[14px] font-medium">
                          {marathon.title}
                        </h5>

                        <Eye
                          className="w-[18px] h-[18px] text-gray-500 cursor-pointer hover:text-black transition"
                          onClick={() => setSelectedMarathonId(marathon._id)}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {clients.length === 0 && (
                        <span className="text-sm text-gray-400">
                          No clients assigned
                        </span>
                      )}

                      {clients.length > 0 && (
                        <div className="flex items-center -space-x-2">
                          {visibleClients.map((client, index) => (
                            <Avatar
                              key={index}
                              className="w-8 h-8 border-2 border-white shadow-sm"
                            >
                              <AvatarImage src={"/"} />
                              <AvatarFallback>
                                {nameInitials(client.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}

                          {extraCount > 0 && (
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <AssignMarathonModal marathonId={marathon._id} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectedMarathonDetails({
  marathon,
  setSelectedMarathonId
}) {
  if (!marathon) return <div className="hidden content-container">
    <ContentError
      className="border-0 hidden"
      title="Select a marathon to see details"
    />
  </div>
  return (
    <div className="content-container space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <ArrowLeft
          className="w-[22px] h-[22px] cursor-pointer text-[var(--dark-1)]/70 hover:text-[var(--primary)] transition"
          onClick={() => setSelectedMarathonId("")}
        />

        <h4 className="text-[20px] font-semibold tracking-tight mr-auto">
          {marathon.title}
        </h4>
        <div>
          <AssignMarathonModal marathonId={marathon._id} />
        </div>
        <CreateMarathonModal type="update" data={marathon}>
          <DialogTrigger className="
            text-gray-600 flex items-center justify-center gap-2  
            text-[13px] font-semibold p-1 md:px-4 md:py-2 
            rounded-md border bg-gray-50
          ">
            <Pencil size={18} />
            <p className="hidden md:block">Edit</p>
          </DialogTrigger>
        </CreateMarathonModal>
        <DeleteMarathonAction marathonId={marathon._id} />
      </div>

      <div className=" mt-4 h-[400px] md:h-[500px] overflow-y-auto no-scrollbar">
        {marathon.tasks.map((task) => (
          <div
            key={task._id}
            className="
              flex items-start gap-4 
              p-5 rounded-2xl mx-2 my-2
              bg-white/90 backdrop-blur-sm
              ring-1 ring-gray-50
              shadow-sm shadow-gray-400 hover:shadow-md
            "
          >
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[var(--dark-1)]">
                {task.title}
              </h3>

              <p className="text-[var(--dark-1)]/60 text-[14px] mt-1">
                {task.description}
              </p>

              {task.photoSubmission && (
                <p className="text-[var(--dark-1)]/30 text-[13px] italic mt-3">
                  * Photo required at submission
                </p>
              )}

              {task.videoSubmission && (
                <p className="text-[var(--dark-1)]/30 text-[13px] italic">
                  * Video required at submission
                </p>
              )}
            </div>
            <Image
              src="/svgs/marathon.svg"
              alt=""
              width={80}
              height={80}
              className="opacity-80 w-[10vw] md:w-[3vw] object-contain ml-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DeleteMarathonAction({ marathonId }) {
  async function deleteMarathon(
    setLoading
  ) {
    try {
      setLoading(true);
      const response = await sendData("app/marathon/coach/deleteMarathon", { marathonId }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <DualOptionActionModal
    description="Are you sure of deleting this marathon!"
    action={(setLoading, btnRef) => deleteMarathon(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 size={18} className=" bg-red-50 rounded-full text-[var(--accent-2)]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}

function getBgColor(index) {
  switch (index) {
    case 0:
      return "bg-[#FFDA47]";
    case 1:
      return "bg-[#F1EAEA]";
    case 2:
      return "bg-[#D7A07C]";

    default:
      return "bg-[var(--comp-1)]";
  }
}

function MarathonLeaderBoard({ marathon, marathonId }) {
  const router = useRouter();
  const { cache } = useSWRConfig();
  const { isLoading, error, data } = useSWR(`app/marathon-points/${marathonId}`, () => getMarathonLeaderBoard(marathonId, router, cache));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const clients = data.data;
  return <div className="content-container">
    <div className="flex items-center gap-4">
      <h4 className="leading-[1] mb-4 mr-auto">{marathon.title}</h4>
    </div>
    <div>
      {clients.map((client, index) => <div
        className={`mb-4 p-4 flex items-center gap-4 border-1 rounded-[10px] ${getBgColor(index)}`}
        key={index}>
        <span>{index + 1}</span>
        <Avatar>
          <AvatarImage src={client.client.profilePhoto} />
          <AvatarFallback>{nameInitials(client.client.name)}</AvatarFallback>
        </Avatar>
        <h3>{client.client.name}</h3>
        <p className="ml-auto">{client.totalPointsInRange}&nbsp;pts</p>
      </div>)}
    </div>
  </div>;
}