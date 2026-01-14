import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddClientModal() {
  return (
    <Dialog>
      <DialogTrigger className="bg-[var(--accent-1)] text-white font-bold px-4 py-2 rounded-full">
        add client modal
      </DialogTrigger>
      <DialogContent className="!max-w-[656px] h-[600px] border-0 p-0 overflow-auto">
        <DialogHeader className="bg-gray-300 py-6 h-[56px]">
          <DialogTitle className="text-black text-sm ml-5">
            Add Client
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-0">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-1 text-sm border-b border-gray-200 py-4">
            <div>
              Name: <span className="font-semibold">John Doe</span>
            </div>
            <div>
              Height: <span className="font-semibold">5 Feet 8 Inches</span>
            </div>
            <div>
              D.O.B: <span className="font-semibold">01-01-1990</span>
            </div>
            <div>
              Ideal Weight: <span className="font-semibold">56 KG</span>
            </div>
            <div>
              Age: <span className="font-semibold">25 yrs</span>
            </div>
            <div>
              Body Type: <span className="font-semibold">Moderate</span>
            </div>
            <div>
              Gender: <span className="font-semibold">Male</span>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-end my-4 gap-2 text-sm">
            <span>Offline</span>
            <span>Online</span>
          </div>

          {/* Statistics */}
          <h3 className="font-semibold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              {
                label: "BMI",
                value: "23.4",
                desc: "Healthy",
                info: "Optimal: 18–23\nOverweight: 23–27\nObese: 27–32",
                icon: "/svgs/bmi.svg",
              },
              {
                label: "Muscle",
                value: "15%",
                info: "Optimal Range: 32–36% for men, 24–30% for women\nAthletes: 38–42%",
                icon: "/svgs/muscle.svg",
              },
              {
                label: "Fat",
                value: "15%",
                info: "Optimal Range:\n10–20% for Men\n20–30% for Women",
                icon: "/svgs/fats.svg",
              },
              {
                label: "Resting Metabolism",
                value: "15%",
                info: "Optimal Range: Varies by age,\ngender, and activity level",
                icon: "/svgs/meta.svg",
              },
              {
                label: "Weight",
                value: "65 Kg",
                desc: "Ideal 75",
                info: "Ideal weight Range:\n118. This varies by height and weight",
                icon: "/svgs/weight.svg",
              },
              {
                label: "Body Age",
                value: "26",
                info: "Optimal Range:\nMatched actual age or lower,\nHigher Poor Health",
                icon: "/svgs/body.svg",
              },
            ].map(({ label, value, desc, info, icon }) => (
              <div
                key={label}
                className="bg-[#F9F9F9] rounded-xl p-4 shadow-sm relative text-center"
              >
                {/* Icon in top-left corner */}
                <img
                  src={icon}
                  alt={`${label} icon`}
                  className="w-5 h-5 absolute top-3 left-3"
                />

                {/* Content */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="text-sm font-semibold mb-2">{label}</div>
                  <div className="relative w-20 h-20 mb-2">
                    <div className="w-full h-full rounded-full border-4 border-green-500 flex items-center justify-center text-xl font-bold text-black">
                      {value}
                    </div>
                  </div>
                  {desc && (
                    <div className="text-green-600 text-sm font-medium">
                      {desc}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-600 whitespace-pre-wrap mt-1">
                    {info}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <div className="mt-6">
            <button className="bg-[var(--accent-1)] text-white font-bold w-full text-center px-4 py-3 rounded-[4px]">
              Next
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
