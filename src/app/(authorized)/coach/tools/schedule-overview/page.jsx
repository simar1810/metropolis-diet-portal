import { Filter } from "lucide-react";
import Image from "next/image";

export default function schedule() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Workout Library</h1>

        <div className="flex items-center gap-3 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2 px-4 py-2 text-green-600 border-[1.5px] border-green-600 rounded-full text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </div>

          <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-green-600 text-white">
            Cardio
          </div>
          <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-500 bg-gray-100">
            Shoulder
          </div>
          <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-500 bg-gray-100">
            Light Weight
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className=" overflow-hidden bg-white">
            <div className="relative">
              <Image
                src="/images/1.png"
                alt="Total Core Workout"
                width={500}
                height={375}
                className="w-full object-cover rounded-xl"
              />
             
            </div>
            <div className="text-lg font-bold">Total Core Workout</div>
            <div className="text-sm opacity-90">Category : 10 MIN</div>
          </div>

          <div className="rounded-xl overflow-hidden bg-white">
            <div className="relative">
              <Image
                src="/images/1.png"
                alt="Total Core Workout"
                width={500}
                height={375}
                className="w-full object-cover"
              />
            </div>
            <div className="text-lg font-bold">Total Core Workout</div>
            <div className="text-sm opacity-90">Category : 10 MIN</div>
          </div>

          <div className="rounded-xl overflow-hidden bg-white">
            <div className="relative">
              <Image
                src="/images/1.png"
                alt="Total Core Workout"
                width={500}
                height={375}
                className="w-full object-cover"
              />
            </div>
            <div className="text-lg font-bold">Total Core Workout</div>
            <div className="text-sm opacity-90">Category : 10 MIN</div>
          </div>

          <div className="rounded-xl overflow-hidden bg-white">
            <div className="relative">
              <Image
                src="/images/1.png"
                alt="Total Core Workout"
                width={500}
                height={375}
                className="w-full object-cover"
              />
            </div>
            <div className="text-lg font-bold">Total Core Workout</div>
            <div className="text-sm opacity-90">Category : 10 MIN</div>
          </div>

          <div className="rounded-xl overflow-hidden bg-white">
            <div className="relative">
              <Image
                src="/images/1.png"
                alt="Total Core Workout"
                width={500}
                height={375}
                className="w-full object-cover"
              />
            </div>
            <div className="text-lg font-bold">Total Core Workout</div>
            <div className="text-sm opacity-90">Category : 10 MIN</div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full text-sm font-medium">
            Assign Workout
          </div>
        </div>
      </div>
    </main>
  );
}
