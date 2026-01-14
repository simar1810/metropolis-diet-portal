"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { getAppClients } from "@/lib/fetchers/app";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PiSparkleFill } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";

export default function Page() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchExclusionTerm, setSearchExclusionTerm] = useState("");
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dietType, setDietType] = useState(null);
  const [subOption, setSubOption] = useState(null);
  const [selectedHealthCondition, setSelectedHealthCondition] = useState([]);
  const [selectedExclusions, setSelectedExclusions] = useState([]);
  const [creditsMap, setCreditsMap] = useState({});
  const query = { page: 1, limit: 540 };

  const { isLoading, error, data } = useSWR(
    `getAppClients?page=${query.page}&limit=${query.limit}`,
    () => getAppClients(query)
  );
  const fetchCredits = async (clientId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/app/meal-plan/ai/requests?clientId=${clientId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      const left = data?.data?.requestsLeft ?? 0;
      setCreditsMap((prev) => ({ ...prev, [clientId]: left }));
    } catch (error) {
      setCreditsMap((prev) => ({ ...prev, [clientId]: 0 }));
    }
  }
  useEffect(() => {
    const clients = data?.data || [];
    if (clients.length > 0) {
      clients.forEach((c) => {
        if (!creditsMap[c._id]) fetchCredits(c._id);
      });
    }
  }, [data]);
  const handleAiGeneration = async (clientId, mode) => {
    try {
      const selectedhealthCondString = selectedHealthCondition.join(", ");
      const exclusions = selectedExclusions.join(", ")
      setIsGenerating(clientId);
      setDropdownOpen(null);
      toast.loading(`Generating ${mode} AI meal plan...`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/app/meal-plan/ai/generate?clientId=${clientId}&mode=${mode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            dietaryType: dietType,
            exclusions,
            dietaryOptions: subOption,
            healthConditions: selectedhealthCondString
          })
        }
      );

      const resData = await response.json();
      toast.dismiss();
      setIsGenerating(null);

      if (response.ok && resData.status_code === 200) {
        toast.success("AI Meal Plan generated successfully!");
        localStorage.setItem("aiMealPlan", JSON.stringify(resData.data));
        await new Promise((r) => setTimeout(r, 1000));
        router.push(`/coach/meals/add-custom/${mode}`);
        setDietType(null);
        setSubOption(null);
        setSearchExclusionTerm("");
        setSelectedExclusions([]);
        setSelectedHealthCondition([]);
        fetchCredits(clientId);
      } else {
        throw new Error(resData.message || "Failed to generate AI plan");
      }
    } catch (err) {
      toast.dismiss();
      setIsGenerating(null);
      toast.error(err.message || "Something went wrong!");
      console.error("Error:", err);
      setDietType(null);
      setSubOption(null);
      setSearchExclusionTerm("");
      setSelectedExclusions([]);
      setSelectedHealthCondition([]);
    }
  };
  const foodExclusionOptions = [
    "No Spinach", "No Lettuce", "No Kale", "No Cabbage", "No Fenugreek leaves",
    "No Mustard greens", "No Coriander", "No Amaranth leaves", "No Potato",
    "No Sweet potato", "No Carrot", "No Beetroot", "No Radish", "No Turnip",
    "No Yam", "No Bottle gourd", "No Bitter gourd", "No Ridge gourd",
    "No Snake gourd", "No Pumpkin", "No Ash gourd", "No Zucchini",
    "No Green beans", "No Cluster beans", "No Flat beans", "No Peas",
    "No Broad beans", "No Okra", "No Tomato", "No Eggplant", "No Capsicum",
    "No Green chili", "No Cauliflower", "No Broccoli", "No Brussels sprouts",
    "No Cucumber", "No Onion", "No Garlic", "No Ginger", "No Mushroom",
    "No Corn", "No Celery", "No Asparagus", "No Lentils", "No Chickpeas",
    "No Kidney beans", "No Black-eyed peas", "No Tofu", "No Soy chunks",
    "No Paneer", "No Curd", "No Cheese", "No Milk", "No Rice", "No Wheat",
    "No Oats", "No Quinoa", "No Millet", "No Barley", "No Almonds",
    "No Peanuts", "No Walnuts", "No Flax seeds", "No Chia seeds",
    "No Sesame seeds", "No Sunflower seeds", "No Chicken", "No Mutton", "No Lamb", "No Beef", "No Pork",
    "No Fish", "No Prawns", "No Crab", "No Lobster", "No Squid",
    "No Eggs", "No Duck", "No Turkey", "No Shellfish", "No Anchovies",
    "No Sardines", "No Tuna", "No Salmon", "No Octopus", "No Clams"
  ];
  if (isLoading) return <ContentLoader />;
  if (error || data?.status_code !== 200)
    return <ContentError title={error || data?.message} />;

  const clients = data?.data || [];

  const filteredClients = clients.filter((client) => (
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) && client.isActive && client.isVerified && client.joiningDate
  ));
  return (
    <main className="content-container content-height-screen relative">
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm w-full">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-16 w-full sm:w-[450px] text-center animate-fade-in">
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/illustrations/support.svg"
                alt="Sorting Illustration"
                width={180}
                height={180}
                className="mx-auto mb-10"
              />
              <h2 className="text-xl font-normal text-gray-800">
                We are Sorting through more than{" "}
                <span className="text-green-600 font-bold">25,000+</span> Meals
                in our Database
              </h2>
              <p className="text-gray-400 text-xs mt-3 px-4">
                This may take some time, but hang on tight — we’re doing magic
                behind the curtains so that you don’t have to take the load.
              </p>
            </div>
          </div>
        </div>
      )}
      {showPreferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[95%] sm:w-[500px] rounded-2xl shadow-lg p-6 relative max-h-[620px] overflow-y-auto no-scrollbar">
            <h2 className="text-xl font-semibold text-left mb-6 py-2 pb-4 border-b-2 border-gray-50">Food Preference for this Client</h2>
            <div className="relative mb-4">
              <p className="text-sm text-gray-400 mb-2">Health Conditions</p>
              <div
                onClick={() => setDropdownOpen(dropdownOpen === "health" ? null : "health")}
                className="flex justify-between items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:ring-2 focus:ring-green-500"
              >
                <span className="text-gray-700 text-sm truncate">
                  {selectedHealthCondition.length > 0
                    ? selectedHealthCondition.join(", ")
                    : "Select conditions"}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${dropdownOpen === "health" ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {dropdownOpen === "health" && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-auto animate-in fade-in slide-in-from-top-2">
                  {["None", "Diabetes", "High BP", "Thyroid", "High Cholesterol"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHealthCondition.includes(option)}
                        onChange={() =>
                          setSelectedHealthCondition((prev) =>
                            prev.includes(option)
                              ? prev.filter((o) => o !== option)
                              : [...prev, option]
                          )
                        }
                        className="mr-2 accent-green-500"
                      />
                      <span className="text-gray-700 text-sm">{option}</span>
                    </label>
                  )
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-2">Select Diet Type</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Vegetarian", img: "/assets/PNG/Veg.png" },
                { label: "Non-Vegetarian", img: "/assets/PNG/Non_veg.png" },
                { label: "Eggetarian", img: "/assets/PNG/Eggetarian.png" },].map((item) => (
                  <button key={item.label} className={`border rounded-xl py-2 pt-6 flex flex-col items-center justify-center 
                ${dietType === item.label
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                    } shadow-lg shadow-gray-100`} onClick={() => {
                      setDietType(item.label);
                      setSubOption(null);
                    }}>
                    <img src={item.img} alt="opt" width={100} height={100} className="w-10" />
                    <p className="text-sm mt-3 font-medium">{item.label}</p>
                  </button>
                ))}
            </div>
            {dietType && (
              <div className="transition-all duration-200">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-sm text-gray-400">Select Options applicable</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {dietType === "Vegetarian" &&
                    [
                      { label: "No Restrictions", img: "/assets/PNG/No_restrictions.png" },
                      { label: "No Garlic & Onion", img: "/assets/PNG/No_Garlic_Onion.png" },
                      { label: "Jain Food", img: "/assets/PNG/Jain_Food.png" }
                    ].map(
                      (opt) => (
                        <button
                          key={opt.label}
                          className={`border py-2 pt-6 flex flex-col items-center justify-center rounded-xl ${subOption === opt.label
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                            }`}
                          onClick={() => setSubOption(opt.label)}
                        >
                          <img src={opt.img} alt="subopt" width={100} height={100} className="w-10" />
                          <p className="text-sm mt-3 font-medium">{opt.label}</p>
                        </button>
                      )
                    )}

                  {dietType === "Non-Vegetarian" &&
                    [
                      { label: "Both Chicken & Mutton", img: "/assets/PNG/chicken_mutton.png" },
                      { label: "Only Chicken", img: "/assets/PNG/Chicken_only.png" },
                      { label: "Only Fish", img: "/assets/PNG/Fish_Only.png" },
                      { label: "Only Mutton", img: "/assets/PNG/mutton.png" },
                      { label: "Chicken, Fish & Mutton", img: "/assets/PNG/fish_chicken_mutton.png" }].map(
                        (opt) => (
                          <button
                            key={opt.label}
                            className={`border py-2 pt-6 flex flex-col items-center justify-center rounded-xl ${subOption === opt.label
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                              }`}
                            onClick={() => setSubOption(opt.label)}
                          >
                            <img src={opt.img} alt="subopt" width={100} height={100} className="w-10" />
                            <p className="text-sm mt-3 font-medium">{opt.label}</p>
                          </button>
                        )
                      )}
                  {dietType === "Eggetarian" &&
                    [
                      { label: "No Restrictions", img: "/assets/PNG/Eggetarian.png" }
                    ].map(
                      (opt) => (
                        <button
                          key={opt.label}
                          className={`border py-2 pt-6 flex flex-col items-center justify-center rounded-xl ${subOption === opt.label
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                            }`}
                          onClick={() => setSubOption(opt.label)}
                        >
                          <img src={opt.img} alt="subopt" width={100} height={100} className="w-10" />
                          <p className="text-sm mt-3 font-medium">{opt.label}</p>
                        </button>
                      )
                    )}
                </div>
                <div className="flex flex-wrap justify-start mb-8">
                  <div className="">
                    <input
                      type="text"
                      value={searchExclusionTerm}
                      onChange={(e) => setSearchExclusionTerm(e.target.value)}
                      className="ring-gray-400 text-gray-500 rounded-lg ring-1  px-3 py-1"
                      placeholder="Exclusions..."
                    />
                    {searchExclusionTerm && (
                      <div className="absolute z-20 mt-1 w-[60%] bg-white border border-gray-200 rounded-md shadow-lg max-h-20 overflow-auto no-scrollbar">
                        {foodExclusionOptions
                          .filter(
                            (item) =>
                              item.toLowerCase().includes(searchExclusionTerm.toLowerCase()) &&
                              !selectedExclusions.includes(item)
                          )
                          .map((item) => (
                            <div
                              key={item}
                              onClick={() => {
                                setSelectedExclusions([...selectedExclusions, item]);
                                setSearchExclusionTerm("");
                              }} className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm text-gray-700">

                              {item}
                            </div>
                          ))}
                        {!foodExclusionOptions.some(
                          (item) =>
                            item.toLowerCase() === searchExclusionTerm.toLowerCase()
                        ) &&
                          searchExclusionTerm.trim() !== "" &&
                          !selectedExclusions.includes(searchExclusionTerm.trim()) && (
                            <div
                              onClick={() => {
                                const customCount = selectedExclusions.filter(
                                  (item) =>
                                    !foodExclusionOptions.includes(item)
                                ).length;

                                if (customCount < 2) {
                                  setSelectedExclusions([
                                    ...selectedExclusions,
                                    searchExclusionTerm.trim(),
                                  ]);
                                  setSearchExclusionTerm("");
                                } else {
                                  toast.info("Max 2 custom exclusions allowed!")
                                }
                              }}
                              className="px-3 py-2 text-[#00984A] hover:bg-blue-50 cursor-pointer text-sm"
                            >
                              + Add “{searchExclusionTerm}” as custom exclusion
                            </div>
                          )}
                        {foodExclusionOptions.filter((item) =>
                          item.toLowerCase().includes(searchExclusionTerm.toLowerCase()) &&
                          !selectedExclusions.includes(item)
                        ).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-400">No results</div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 ml-2">
                    {selectedExclusions.length > 0 && (
                      selectedExclusions.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
                        >
                          {item}
                          <button
                            onClick={() =>
                              setSelectedExclusions(
                                selectedExclusions.filter((i) => i !== item)
                              )} className="text-green-500 hover:text-red-500">✕</button>
                        </div>
                      )))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setShowPreferenceModal(false);
                setDietType(null);
                setSubOption(null);
                setSelectedExclusions([]);
                setSelectedHealthCondition([]);
              }}> Cancel </Button>
              <Button
                disabled={!dietType || !subOption}
                className="bg-[#00984A] text-white hover:bg-green-600"
                onClick={() => {
                  setShowPreferenceModal(false);
                  handleAiGeneration(selectedClient, selectedMode);
                }}> Continue
              </Button>
            </div>
          </div>
        </div>)}
      <div className="flex flex-wrap gap-4 md:gap-0 items-center justify-between mt-4 mb-6 sticky top-0 bg-white z-20 pb-2">
        <h4 className="text-sm md:text-2xl font-semibold">Clients Lists for Meal Plan</h4>

        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00984A] transition-all"
          />
        </div>
      </div>

      <div
        className="overflow-y-auto no-scrollbar"
        style={{ maxHeight: "70vh" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {filteredClients.map((client) => (
            <div
              key={client._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 pb-8 flex flex-col items-start gap-4 hover:shadow-md transition-shadow relative"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0">
                  <Image
                    src={client.image || "/profile1.jpg"}
                    alt={client.name}
                    width={60}
                    height={60}
                    className="rounded-xl object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row items-start justify-start md:justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-1 md:mb-2">
                        {client.name || "Unknown Client"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Joined on{" "}
                        {client.joiningDate || "NA"}
                      </p>
                      <p className="text-xs text-green-500">
                        {client.isActive && "Active"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 mt-1 md:mt-0 px-2 md:pl-4 py-1 md:py-2 rounded-md">
                      <PiSparkleFill size={14} className="text-[#00984A]" />
                      <p className="text-[10px] text-[#00984A] font-medium ">
                        {creditsMap[client._id] !== undefined ? `${creditsMap[client._id]} Credits Left` : "Loading..."}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:flex gap-2 mt-3 relative">
                    <Button
                      className="bg-white text-[#00984A] border border-green-200 hover:bg-[#00984A] hover:text-white text-xs px-3 py-1 rounded-md"
                      onClick={() =>
                        router.push(`/coach/meals/list-custom`)
                      }
                    >
                      View Current Meal Plan
                    </Button>
                    <div className="relative">
                      <Button
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === client._id ? null : client._id
                          )
                        }
                        disabled={isGenerating === client._id}
                        className={`text-xs px-3 py-1 rounded-md ${isGenerating === client._id
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-[#00984A] text-white hover:bg-green-600"
                          }`}
                      >
                        {isGenerating === client._id
                          ? "Generating..."
                          : "Create AI Meal Plan"}
                      </Button>
                      {dropdownOpen === client._id && (
                        <div className="absolute top-10 right-0 bg-green-50 border border-gray-200 shadow-md rounded-md w-32 z-10">
                          <button
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-white"
                            onClick={() => {
                              setSelectedClient(client._id);
                              setSelectedMode("daily");
                              setShowPreferenceModal(true);
                              setDropdownOpen(null);
                            }}
                          >
                            Daily
                          </button>
                          <button
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-white"
                            onClick={() => {
                              setSelectedClient(client._id);
                              setSelectedMode("weekly");
                              setShowPreferenceModal(true);
                              setDropdownOpen(null);
                            }}
                          >
                            Weekly
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex md:hidden gap-2 mt-3 relative">
                <Button
                  className="bg-white text-[#00984A] border border-green-200 hover:bg-[#00984A] hover:text-white md:text-xs px-3 py-1 rounded-md text-[10px]"
                  onClick={() =>
                    router.push(`/coach/meals/list-custom`)
                  }
                >
                  View Current Meal Plan
                </Button>
                <div className="relative">
                  <Button
                    onClick={() =>
                      setDropdownOpen(
                        dropdownOpen === client._id ? null : client._id
                      )
                    }
                    disabled={isGenerating === client._id}
                    className={`text-[10px] md:text-xs px-3 py-1 rounded-md ${isGenerating === client._id
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#00984A] text-white hover:bg-green-600"
                      }`}
                  >
                    {isGenerating === client._id
                      ? "Generating..."
                      : "Create AI Meal Plan"}
                  </Button>
                  {dropdownOpen === client._id && (
                    <div className="absolute top-10 right-0 bg-green-50 border border-gray-200 shadow-md rounded-md w-32 z-10">
                      <button
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-white"
                        onClick={() => {
                          setSelectedClient(client._id);
                          setSelectedMode("daily");
                          setShowPreferenceModal(true);
                          setDropdownOpen(null);
                        }}
                      >
                        Daily
                      </button>
                      <button
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-white"
                        onClick={() => {
                          setSelectedClient(client._id);
                          setSelectedMode("weekly");
                          setShowPreferenceModal(true);
                          setDropdownOpen(null);
                        }}
                      >
                        Weekly
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <p className="text-gray-500 text-center col-span-full">
              No clients found.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
