import { format } from "date-fns";
import { fetchData, sendData } from "../api";
import { buildUrlWithQueryParams } from "../formatter";
import { toast } from "sonner";
import { withClientFilter } from "../middleware/clientFilter";

async function logoutUser(response, router, cache) {
  if (
    (response?.status_code === 411,
      response?.message?.toLowerCase() === "something went wrong")
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await fetch("/api/logout", { method: "DELETE" });
    for (const [field] of cache.entries()) {
      cache.delete(field);
    }
    router.push("/login");
    return;
  }
}

export function getCoachProfile(_id) {
  return fetchData(`app/coachProfile?id=${_id}&portal=web`);
}

export const getCoachHome = withClientFilter(async (router, cache) => {
  const response = await fetchData("app/coachHomeTrial");
  await logoutUser(response, router, cache);
  return response;
});

export function coachMatricesData() {
  return fetchData("app/activity/get?person=coach");
}

export const dashboardStatistics = withClientFilter(async (router, cache) => {
  const response = await fetchData("app/coach-statistics");
  logoutUser(response, router, cache);
  return response;
});

export function getCoachNotifications() {
  return fetchData("app/notification?person=coach");
}

export function getCoachSocialLinks() {
  return fetchData("app/sm");
}

export function getMeals(searchQuery) {
  return fetchData(`app/getMeal?query=${searchQuery}`);
}

export function getRecipes() {
  return fetchData("app/getRecipes?person=coach");
}

export function getPlans() {
  return fetchData("app/plans");
}

export function getOrganisation() {
  return fetchData("app/getOrganisation");
}

export const getAppClients = withClientFilter((query) => {
  let queries = "";
  if (query?.page) queries += "page=" + query.page + "&";
  if (query?.limit) queries += "limit=" + query.limit + "&";
  if (query?.isActive) queries += "isActive=" + query.isActive + "&";
  return fetchData(`app/allClient?${queries}`);
});

export function getAppClientPortfolioDetails(_id) {
  return fetchData(`app/clientProfile?id=` + _id);
}

export function getClientStatsForCoach(clientId) {
  return fetchData(`app/clientStatsCoach?clientId=${clientId}`);
}

export function getClientMealPlanById(_id) {
  return fetchData(`app/meal-plan/client/${_id}`);
}

export function getClientOrderHistory(clientId) {
  return fetchData(`app/client/retail-order/${clientId}`);
}

export function getAppFeeds(state, person = "coach") {
  const query = `page=${state.page}&type=${state.type}`;
  return fetchData(`app/feeds2?person=${person}&` + query);
}

export function getAppPersonalFeeds(state, limit) {
  let query = `page=${state.page}`;
  if (limit) query += `&limit=${limit}`;
  return fetchData("app/my-posts?person=coach&" + query);
}

export function getFeedComments(postId) {
  return fetchData(`app/get-comments?postId=${postId}`);
}

export function getRetail(whitelabel) {
  let query = "";
  if (whitelabel) {
    query += `whitelabel=${whitelabel}`;
  }
  return fetchData(`app/coach-retail?${query}`);
}

export function getOrderHistory() {
  return fetchData("app/order-history");
}

export function getNotes(person = "coach") {
  return fetchData(`app/notes?person=${person}`);
}

export const getReminders = withClientFilter((person = "coach") => {
  return fetchData(`app/getAllReminder?person=${person}`);
});

export function getRecipesCalorieCounter(query) {
  if (query.length <= 3) {
    toast.error("At least enter 3 characters.")
    return;
  }
  return fetchData(`app/recipees?query=${query}`);
}

export const getAllChatClients = withClientFilter(() => {
  return fetchData("app/getAllChatClients");
});

export function getPersonalBranding() {
  return fetchData("app/list?person=coach");
}

export const getClientForMeals = withClientFilter((planId) => {
  return fetchData(`app/getClientForMeals?planId=${planId}`);
});

export function getCustomMealPlanDetails(planId) {
  return fetchData(`app/meal-plan/client/${planId}`);
}

export const getClientsForCustomMeals = withClientFilter((planId) => {
  return fetchData(`app/meal-plan/custom/assign?id=${planId}`);
});

export function getProductByBrand(brandId) {
  return fetchData(`app/getProductByBrand/${brandId}`);
}

export function getWorkouts() {
  return fetchData("app/workout/coach/workoutCollections");
}

export function getMarathons() {
  return fetchData("app/marathon/coach/listMarathons");
}

export async function getMarathonLeaderBoard(marathonId, router, cache) {
  let query = "person=coach";
  if (Boolean(marathonId)) query += `&marathonId=${marathonId}`;
  const response = await fetchData(`app/marathon/coach/points?${query}`);
  await logoutUser(response, router, cache);
  return response;
}

export function getMarathonClientTask(
  clientId,
  date = format(new Date(), "dd-MM-yyyy")
) {
  return fetchData(
    `app/marathon/coach/viewProgress?clientId=${clientId}&date=${date}`
  );
}

export function getMealPlanById(id) {
  return fetchData(`app/get-plan-by-id?id=${id}`);
}

export function getSyncCoachesList() {
  return fetchData("app/sync-coach/super");
}

export function getSyncedCoachesClientList(coachId) {
  return fetchData(`app/sync-coach/super/client?coachId=${coachId}`);
}

export function getMarathonTaskOptions() {
  return fetchData("app/marathon/coach/task-options");
}

export const getClientsForMarathon = withClientFilter((marathonId) => {
  return fetchData(
    `app/marathon/coach/getClientsForMarathon?marathonId=${marathonId}`
  );
});

export const getClientsForWorkout = withClientFilter((workoutId) => {
  return fetchData(
    `app/workout/coach/getClientForWorkouts?workoutCollectionId=${workoutId}`
  );
});

export function getAllWorkoutItems() {
  return fetchData("app/workout/coach/getAllWorkoutsItems");
}

export function getWorkoutDetails(workoutId, person = "coach") {
  let endpoint = `app/workout/client/getWorkout?person=${person}`;
  if (workoutId) endpoint += `&id=${workoutId}`;
  return fetchData(endpoint);
}

export function getAllSubscriptions() {
  return fetchData("app/allCoachSubscriptions");
}

export function getChatBotData() {
  return fetchData("chatbot");
}

export function getClientPrograms() {
  return fetchData("app/programs?person=client&limit=100");
}

export function getClientWorkouts(id) {
  return fetchData(`app/workout/workout-plan/client/${id}`);
}

/**
 * Client Fetchers
 */

export function getClientHome(id) {
  return fetchData(`app/clientHome/${id}/wellnessz`);
}

export function getClientProfile() {
  return fetchData(`app/viewClient?wz_client=web`);
}

export function getClientMatrices(person, id) {
  return fetchData(`app/get-all-healthmatrix?person=${person}&id=${id}`);
}

export function getWorkoutForClient(id) {
  return fetchData(`app/workout/workout-plan/client/${id}`);
}

export function getClientNextMarathonClient(date) {
  return fetchData(`app/marathon/client/viewTask?date=${date}`);
}

export function clientOrderHistory(clientId) {
  return fetchData(`app/client-order-history?clientId=${clientId}`);
}

export function getBrands() {
  return fetchData("app/getBrand");
}

export function getWzSessions(person) {
  return fetchData(`app/getAllWzSessionDemos?person=${person}`);
}

export function getCustomMealPlans(person, planId) {
  if (planId) {
    return fetchData(`app/meal-plan/custom/${planId}?person=${person}`);
  } else {
    return fetchData(`app/meal-plan/custom?person=${person}`);
  }
}

export function getCustomWorkoutPlans(person = "coach", workoutId) {
  let endpoint = `app/workout/workout-plan/custom?person=${person}`;
  if (workoutId) endpoint += `&workoutId=${workoutId}`;
  return fetchData(endpoint);
}

export const getClientsForCustomWorkout = withClientFilter((workoutId) => {
  return fetchData(`app/workout/workout-plan/custom/assign?id=${workoutId}`);
});

export async function onboardingQuestionaire() {
  return fetchData("app/onboarding/questionaire?person=coach");
}

export const retrieveSessions = withClientFilter((person) => {
  return fetchData(`app/workout/sessions?person=${person}`);
});

export function retrieveAIAgentHistory(clientId, date) {
  let endpoint = `app/ai/analyze?person=coach&client=${clientId}`
  if (date && date !== "01-01-1970") endpoint += `&date=${date}`
  return fetchData(endpoint)
}

export const retrieveReports = withClientFilter(function (person = "coach", clientId) {
  let query = `person=${person}`
  if (clientId) query += `&clientId=${clientId}`
  return fetchData(`app/reports/client?${query}`)
})

export const retrieveCoachClientList = withClientFilter(() => {
  return fetchData("app/coach-client-list")
});

export const retrieveClientNudges = withClientFilter((id, options) => {
  const endpoint = buildUrlWithQueryParams(
    "app/notifications-schedule",
    Boolean(id)
      ? { clientId: id, ...options }
      : options
  )
  return fetchData(endpoint)
});

export function retrieveDownlineRequests() {
  return fetchData("app/downline/requests")
}

export function retrieveDownlineCoaches() {
  return fetchData("app/downline")
}

export function retrieveDownlineCoachInformation(query) {
  const endpoint = buildUrlWithQueryParams(
    "app/downline/coach",
    query
  )
  return fetchData(endpoint)
}

export function retrieveDownlineClientInformation(query) {
  const endpoint = buildUrlWithQueryParams(
    "app/downline/client",
    query
  )
  return fetchData(endpoint)
}

export function getPhysicalAttendance(query) {
  const endpoint = buildUrlWithQueryParams(
    "app/physical-club/attendance",
    query
  )
  return fetchData(endpoint)
}

export function getPhysicalMemberships(query) {
  const endpoint = buildUrlWithQueryParams(
    "app/physical-club/memberships",
    query
  )
  return fetchData(endpoint)
}

export async function retrieveQuestionaire(query) {
  const endpoint = buildUrlWithQueryParams("app/onboarding/questionaire", query)
  return fetchData(endpoint);
}

export async function retrieveBankDetails(query) {
  const endpoint = buildUrlWithQueryParams("app/bank", query);
  return fetchData(endpoint)
}

// Users management functions
export function getUsers(coachId = null) {
  const endpoint = coachId
    ? `app/users?person=coach&coachId=${coachId}`
    : "app/users?person=coach";
  return fetchData(endpoint);
}


export async function createUser(userData) {
  try {
    const { permissions, ...userDataWithoutPermissions } = userData;

    const createResponse = await sendData("app/users", userData, "POST");

    if (createResponse.status_code === 200 && permissions && permissions.length > 0) {
      try {
        const userId = createResponse.data?._id;

        if (userId) {
          const permissionsData = {
            id: userId,
            permissions: permissions
          };

          await sendData("app/users/permissions", permissionsData, "PUT");
        }
      } catch (permissionsError) {
        // Don't fail the entire request if permissions update fails
      }
    }

    return createResponse;
  } catch (error) {
    throw error;
  }
}

export function updateUser(userData) {
  return sendData("app/users", userData, "PUT");
}

export function deleteUser(userId) {
  return sendData("app/users", { id: userId }, "DELETE");
}

// Client assignment functions
export function addClientToUser(userId, clientId) {
  return sendData("app/users/clients/add", { userId, clientId }, "POST");
}

export function removeClientFromUser(userId, clientId) {
  return sendData("app/users/clients/remove", { userId, clientId }, "POST");
}

export function assignClientsToUser(userId, clientIds) {
  return sendData("app/users/clients/assign", { userId, clientIds }, "PUT");
}

export function getUserClients(userId, page = 1, limit = 10) {
  return fetchData(`app/users/assignments/${userId}/clients?page=${page}&limit=${limit}`);
}

export const getAvailableClients = withClientFilter((page = 1, limit = 1000, search = "") => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  return fetchData(`app/users/clients/available?page=${page}&limit=${limit}${searchParam}`);
});

export const fetchClubSubscription = function (coachId) {
  const endpoint = "app/clubSubscription/coach/" + coachId
  return fetchData(endpoint)
}

export async function retrieveClientList() {
  return fetchData("app/downline/client-list")
}

// User login function
export async function loginUser(userData) {
  try {
    // Ensure backend receives both `username` and `password`
    // while keeping backward compatibility with existing `userId`-based payloads.
    const payload = {
      username: userData.username || userData.userId || "",
      // Preserve original field in case backend currently expects `userId`
      userId: userData.userId ?? userData.username ?? "",
      password: userData.password,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/app/signin?authMode=mob&clientType=web`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const responseData = await response.json();

    if (responseData.status_code === 200) {
      const userPayload =
        responseData.data?.user ||
        responseData.data?.createdBy ||
        responseData.data;
      const refreshTokenList = Array.isArray(userPayload?.webRefreshTokenList)
        ? [...userPayload.webRefreshTokenList]
        : [];
      const refreshToken = refreshTokenList.pop();

      if (!userPayload || !refreshToken || !userPayload._id) {
        throw new Error("Missing user authentication data");
      }

      const authHeaderResponse = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          _id: userPayload._id,
          userType: "coach",
          userData: responseData.data,
        }),
      });

      const authHeaderData = await authHeaderResponse.json();

      if (authHeaderData.status_code !== 200) {
        throw new Error(authHeaderData.message || "Failed to set authentication token");
      }

      return {
        success: true,
        data: responseData.data,
        message: "Login successful"
      };
    } else {
      throw new Error(responseData.message || "Login failed");
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Login failed. Please try again."
    };
  }
}
