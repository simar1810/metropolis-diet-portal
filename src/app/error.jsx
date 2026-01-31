'use client'
export default function Error({ reset }) {
  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-red-600 text-xl">⚠️</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          An unexpected error occurred. Please try again or refresh the page.
        </p>

        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  )
}