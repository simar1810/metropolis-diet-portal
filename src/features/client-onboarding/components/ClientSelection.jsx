"use client";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { updateDetails } from "../state/client-onboarding-reducer";
import { fetchData, sendData } from "@/lib/api";

export default function ClientSelection() {
  const { clientsList, dispatch, ...state } = useCurrentStateContext();

  async function handleSelectClient(client) {
    let preferences = {}
    try {
      const response = await fetchData(`app/metropolis/customer/relation`)
      preferences = response.data.preferences
    } catch (error) { }
    const [weight, weightUnit] = preferences.weight?.split(" ")
    const [height, heightUnit] = preferences.height?.split(" ")
    dispatch(updateDetails({
      selectedClientDetails: client,
      dailyActivity: preferences.activityLevel,
      allergies: preferences.allergies,
      countryPreference: preferences.countryPreferences,
      medicalConditions: preferences.medicalConditions,
      weight: weight || "",
      weightUnit: weightUnit || "",
      height: height || "",
      heightUnit: heightUnit || "",
      regionPreference: preferences.regionPreference,
      dietPreference: preferences.dietPreference,
      dob: client.dob,
      stage: "goal"
    }));
  }

  const handleAddClient = function (client) {
    dispatch(updateDetails({
      selectedClientDetails: client,
      stage: "mobilenumber"
    }));
  }

  return <div>
    <div className="max-h-[400px] overflow-y-auto space-y-2">
      {clientsList.map((client, index) => <div
        key={index}
        className="px-4 py-2 rounded-[6px] border-1 flex items-center gap-4 bg-white cursor-pointer hover:bg-white/50"
        onClick={() => handleSelectClient(client)}
      >
        <Avatar>
          <AvatarFallback>{nameInitials(client.patientName)}</AvatarFallback>
        </Avatar>
        <div>
          <h5>{client.patientName}</h5>
          <p className="text-sm text-gray-400">Patient ID: {client.pid}</p>
        </div>
      </div>)}
    </div>
    <button onClick={handleAddClient} className="w-full mt-4 text-sm bg-[var(--accent-1)] py-2 border-1 font-bold text-white rounded-[10px]">
      Add Family Member
    </button>
  </div>
}