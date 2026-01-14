"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "../FormControl";
import useSWR from "swr";
import { getClientsForCustomWorkout, getClientsForWorkout } from "@/lib/fetchers/app";
import ContentLoader from "../common/ContentLoader";
import ContentError from "../common/ContentError";
import { toast } from "sonner";
import { use, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { Button } from "../ui/button";
import { sendData } from "@/lib/api";
import { AlertDialogTrigger } from "../ui/alert-dialog";
import { X } from "lucide-react";
import DualOptionActionModal from "./DualOptionActionModal";

export default function AssignWorkoutModal({
  type,
  workoutId
}) {
  const Component = selectComponent(type);
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white text-[12px] font-bold px-4 py-2 rounded-[8px] overflow-auto">
        Assign
      </DialogTrigger>
      <DialogContent className="!max-w-[650px] h-[70vh] border-0 p-0 overflow-auto block">
        <DialogHeader className="py-4 px-6 border-b">
          <DialogTitle className="text-lg font-semibold pb-1 w-fit">
            Assign Workout
          </DialogTitle>
        </DialogHeader>
        <Component workoutId={workoutId} />
      </DialogContent>
    </Dialog>
  );
}

function AssignCustomWorkoutContainer({ workoutId }) {
  const { isLoading, error, data, mutate } = useSWR(`getClientsForWorkouts/${workoutId}`, () => getClientsForCustomWorkout(workoutId));
  const [selectedClient, setSelectedClient] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  if (isLoading) return <ContentLoader />
  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  async function assignMealPlan() {
    try {
      const response = await sendData(`app/workout/workout-plan/custom/assign?id=${workoutId}`, { id: workoutId, clients: [selectedClient] })
      if (response.status_code !== 200) throw new Error(response.error || response.message);
      toast.success(response.message);
      mutate()
    } catch (error) {
      toast.error(error.message);
    }
  }
  const assignedClients = data.data.assignedClients.filter(client => new RegExp(searchQuery, "i").test(client.name));
  const unassignedClients = data.data.notAssignedClients.filter(client => new RegExp(searchQuery, "i").test(client.name))

  return <div className="p-4 mb-auto text-sm space-y-6">
    <div>
      <FormControl
        placeholder="Search Client here"
        className="w-full bg-gray-50 rounded-lg"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <p className="mt-4 font-medium">{unassignedClients.length} Clients Available</p>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium mb-4">Workouts Already Assigned</h3>
        <div className="space-y-4">
          {assignedClients.map((client, index) => <SelectedClient
            key={index}
            custom={true}
            client={client}
            mutate={mutate}
            workoutId={workoutId}
          />)}
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-4">Not Assigned</h3>
        <div className="space-y-4">
          {unassignedClients.map((client, index) => <SelectClient
            key={index}
            client={client}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />)}
        </div>
      </div>
    </div>
    {selectedClient && <div className="bg-white sticky bottom-0 text-center py-2">
      <Button onClick={assignMealPlan} variant="wz">
        Assign Workout
      </Button>
    </div>}
  </div>
}

function AssignWorkoutContainer({ workoutId }) {
  const { isLoading, error, data, mutate } = useSWR(`getClientsForWorkouts/${workoutId}`, () => getClientsForWorkout(workoutId));
  const [selectedClient, setSelectedClient] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  async function assignWorkout() {
    try {
      const data = {
        workoutCollectionId: workoutId,
        clientId: selectedClient
      }
      const response = await sendData("app/workout/coach/assignWorkout", data, "PUT")
      if (response.status_code !== 200) throw new Error(response.error || response.message);
      toast.success(response.message);
      mutate()
    } catch (error) {
      toast.error(error.message);
    }
  }

  const assignedClients = data.data.assignedClients.filter(client => new RegExp(searchQuery, "i").test(client.name));
  const unassignedClients = [
    ...data.data.unassignedClients.filter(client => new RegExp(searchQuery, "i").test(client.name)),
    ...data.data.assignedToOtherPlans.filter(client => new RegExp(searchQuery, "i").test(client.name)),
  ];

  return <div className="p-4 mb-auto text-sm space-y-6">
    <div>
      <FormControl
        placeholder="Search Client here"
        className="w-full bg-gray-50 rounded-lg"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <p className="mt-4 font-medium">{unassignedClients.length} Clients Available</p>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium mb-4">Assigned To Other Workouts</h3>
        <div className="space-y-4">
          {assignedClients.map((client, index) => <SelectedClient
            key={index}
            client={client}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />)}
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-4">Not Assigned</h3>
        <div className="space-y-4">
          {unassignedClients.map((client, index) => <SelectClient
            key={index}
            client={client}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />)}
        </div>
      </div>
    </div>
    {selectedClient && <div className="bg-white sticky bottom-0 text-center py-2">
      <Button onClick={assignWorkout} variant="wz">
        Assign Workout
      </Button>
    </div>}
  </div>
}

function SelectedClient({
  custom = false,
  client,
  workoutId,
  mutate
}) {
  async function unassignClient(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(
        "app/workout/workout-plan/custom/unassign",
        { clients: [client._id], id: workoutId },
        "POST"
      );
      if (response.status_code !== 200) throw new Error(response.message || "Please try again later!");
      mutate()
      toast.success(response.message);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message || "Please try again Later!");
    } finally {
      setLoading(false);
    }
  }
  return <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={client.profilePhoto || "/"} />
      <AvatarFallback>{nameInitials(client.name)}</AvatarFallback>
    </Avatar>
    <span className="flex-1">{client.name}</span>
    {custom
      ? <DualOptionActionModal
        description="Are you sure unassign this client from the meal plan?"
        action={(setLoading, closeBtnRef) => unassignClient(setLoading, closeBtnRef)}
      >
        <AlertDialogTrigger>
          <X className="w-[20px] h-[20px] text-[var(--accent-2)]" strokeWidth={3} />
        </AlertDialogTrigger>
      </DualOptionActionModal>
      : <FormControl
        type="checkbox"
        checked
        disabled
        className="w-5 h-5"
      />}
  </div>
}

function SelectClient({
  client,
  selectedClient,
  setSelectedClient
}) {
  return <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={client.profilePhoto || "/"} />
      <AvatarFallback>{nameInitials(client.name)}</AvatarFallback>
    </Avatar>
    <label className="grow flex items-center gap-3">
      <span className="flex-1 cursor-pointer">{client.name}</span>
      <FormControl
        type="checkbox"
        name="assign"
        value="symond"
        checked={selectedClient === client._id}
        onChange={() => setSelectedClient(prev => prev === client._id ? undefined : client._id)}
        className="w-5 h-5"
      />
    </label>
  </div>
}

function selectComponent(type) {
  switch (type) {
    case "normal":
      return AssignWorkoutContainer;
    case "custom":
      return AssignCustomWorkoutContainer;
  }
}