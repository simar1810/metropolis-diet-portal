import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchData, sendData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export default function CopyMealNotifications({ clientId }) {
  return <Dialog>
    <DialogTrigger asChild>
      <Button variant="wz" className="font-medium">
        📋 Copy from Meal Plan
      </Button>
    </DialogTrigger>
    <DialogContent className="!max-w-[700px] w-full max-h-[85vh] overflow-hidden flex flex-col p-0">
      <DialogTitle className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 text-lg font-semibold text-gray-900">
        Copy Meal Plan Nudges
      </DialogTitle>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Container clientId={clientId} />
      </div>
    </DialogContent>
  </Dialog>
}

function Container({ clientId }) {
  const [loading, setLoading] = useState(false)
  const [selectedMealPlans, setSelectedPlans] = useState("")
  const closeRef = useRef(null)
  const { isLoading, error, data } = useSWR(
    `notification-copy/meal-plan/${clientId}`,
    () => fetchData(`app/notification-copy/meal-plan/${clientId}`)
  );

  if (isLoading) return <Loader />

  if (error || data?.status_code !== 200) return <ContentError
    className="!max-h-[80px]"
    title={error || data?.message || "Failed to load meal plans"}
  />

  const meals = data?.data || [];

  async function saveMealPlan() {
    try {
      setLoading(true);
      const response = await sendData(
        `app/notification-copy/meal-plan/${clientId}`,
        { 
          clientId, 
          mealId: selectedMealPlans,
          isImageRequired: true // Meal plan nudges always require images
        }
      );
      
      // Handle response
      if (!response) {
        toast.error("Unable to connect to the server. Please check your connection and try again.");
        return;
      }
      
      // Check if response is an Error object
      if (response instanceof Error) {
        toast.error("An error occurred while copying nudges. Please try again.");
        return;
      }
      
      // Check for explicit error indicators - only show error if status_code is NOT 200 or explicit error field exists
      const isError = 
        (response.status_code !== 200 && response.status_code !== undefined) ||
        (response.statusCode !== 200 && response.statusCode !== undefined) ||
        response.success === false ||
        response.error;
      
      if (isError) {
        // Extract error message and make it client-centric
        const errorMessage = response.message || response.error || response.errorMessage || "An error occurred";
        
        // Transform technical errors into user-friendly messages
        let userFriendlyMessage = errorMessage;
        
        if (errorMessage.toLowerCase().includes("past") || errorMessage.toLowerCase().includes("future")) {
          userFriendlyMessage = "Some nudges are scheduled for past dates. Please ensure all nudges are scheduled for future dates only.";
        } else if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("does not exist")) {
          userFriendlyMessage = "The selected meal plan could not be found. Please try selecting a different meal plan.";
        } else if (errorMessage.toLowerCase().includes("permission") || errorMessage.toLowerCase().includes("unauthorized")) {
          userFriendlyMessage = "You don't have permission to copy nudges from this meal plan.";
        } else if (errorMessage.toLowerCase().includes("validation") || errorMessage.toLowerCase().includes("invalid")) {
          userFriendlyMessage = "The meal plan data is invalid. Please contact support if this issue persists.";
        } else if (errorMessage.toLowerCase().includes("server") || errorMessage.toLowerCase().includes("500")) {
          userFriendlyMessage = "A server error occurred. Please try again in a few moments.";
        } else {
          userFriendlyMessage = `Unable to copy nudges: ${errorMessage}`;
        }
        
        toast.error(userFriendlyMessage);
        return;
      }
      
      // If status_code is 200 or not explicitly an error, treat as success
      if (response.status_code === 200 || response.statusCode === 200 || !isError) {
        toast.success(response.message || "Meal plan nudges have been copied successfully!");
        mutate(`client/nudges/${clientId}`);
        if (closeRef.current) {
          closeRef.current.click();
        }
      }
    } catch (error) {
      // Handle network errors and other exceptions
      const errorMessage = error?.message || error?.toString() || "An unexpected error occurred";
      
      let userFriendlyMessage = "Unable to copy nudges at this time. ";
      
      if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")) {
        userFriendlyMessage += "Please check your internet connection and try again.";
      } else if (errorMessage.toLowerCase().includes("timeout")) {
        userFriendlyMessage += "The request took too long. Please try again.";
      } else {
        userFriendlyMessage += "Please try again or contact support if the problem continues.";
      }
      
      toast.error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  }

  if (meals.length === 0) {
    return <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
      <div className="text-4xl mb-3">🍽️</div>
      <p className="text-sm font-medium text-gray-700 mb-1">No meal plans available</p>
      <p className="text-xs text-gray-500">
        Create a meal plan first to copy nudges from it.
      </p>
    </div>
  }

  // Since each client has only 1 meal plan, show it as a single card
  const meal = meals[0];
  const isSelected = meal._id === selectedMealPlans;

  return <div className="space-y-5">
    <div>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Meal Plan
        </h3>
        <p className="text-xs text-gray-600">
          Copy all nudges from this meal plan to the client. The nudges will be scheduled for future dates only.
        </p>
      </div>
      <div 
        className={cn(
          "p-5 rounded-lg border-2 cursor-pointer transition-all",
          "hover:shadow-md",
          isSelected
            ? "bg-blue-50 border-blue-500 shadow-lg ring-2 ring-blue-200"
            : "bg-white border-gray-200 hover:border-blue-300"
        )}
        onClick={() => setSelectedPlans(prev => meal._id === prev ? "" : meal._id)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🍽️</span>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 mb-1">
                  {meal.title || "Untitled Meal Plan"}
                </p>
                {meal.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {meal.description}
                  </p>
                )}
              </div>
            </div>
            {isSelected && (
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mt-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Selected - Ready to copy
              </div>
            )}
          </div>
          {isSelected && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {selectedMealPlans && (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Selected meal plan:</p>
          <p className="text-sm font-semibold text-gray-900">
            {meals.find(m => m._id === selectedMealPlans)?.title || "Selected meal plan"}
          </p>
        </div>
        <Button
          variant="wz"
          onClick={saveMealPlan}
          disabled={loading}
          className="font-semibold min-w-[140px]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Copying...
            </span>
          ) : (
            "Copy Nudges"
          )}
        </Button>
      </div>
    )}
    <DialogClose ref={closeRef} className="hidden" />
  </div>
}