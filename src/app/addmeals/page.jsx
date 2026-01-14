import FormControl from "@/components/FormControl";

export default function CreateMeal() {
  return (
    <div className="p-6 font-sans border rounded-md shadow-md bg-white">
      <h1 className="text-2xl font-semibold mb-4">Create Meal</h1>



      <div className="flex gap-8">

        <div className="w-80 border border-grey-500 rounded-md px-2 py-2 pr-4x">
          <div className="border rounded-md p-4 text-center relative">
            <div className="border border-dashed border-gray-400 py-10 mb-4 relative">
              <p className="text-gray-500">Add your Meal</p>
              <span className="absolute top-1 right-2 text-gray-400 cursor-pointer">
                ✕
              </span>
            </div>
            <button className="mt-2 px-4 py-2 border rounded">
              ⬆ Upload your Own Image
            </button>
          </div>
          <div className="mt-4">
            <label className="block mb-1">Name</label>
            <FormControl
              type="text"
              placeholder="Enter Name"
              className="w-full  px-3 py-2 rounded"
            />
          </div>
          <div className="mt-4">
            <label className="block mb-1">Meal Time</label>
            <FormControl
              type="text"
              placeholder="Select Time"
              className="w-full  px-3 py-2 rounded"
            />
          </div>
          <div className="mt-4">
            <label className="block mb-1">Description</label>
            <FormControl
              type="text"
              placeholder="Enter description here"
              className="w-full  px-3 py-2 rounded"
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-52">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-3xl mb-2">
            +
          </div>
          <p className="font-semibold">Add More Recipes</p>
        </div>
      </div>
      <div className="mt-10 text-right">
        <button className="bg-[var(--accent-1)] text-white px-6 py-3 rounded-md text-lg">
          Create Plan
        </button>
      </div>
    </div>
  );
}
