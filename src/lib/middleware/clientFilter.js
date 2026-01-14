import { getUserType } from "../permissions";

export function withClientFilter(originalFetcher) {
  return async function filteredFetcher(...args) {
    try {
      const userType = getUserType();

      if (userType === "coach") {
        return await originalFetcher(...args);
      }

      if (userType === "user") {
        // Get assigned client IDs from cookies
        const clientIdsCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userClientIds='))
          ?.split('=')[1];

        let assignedClientIds = [];

        if (clientIdsCookie) {
          try {
            const decodedCookie = decodeURIComponent(clientIdsCookie);
            assignedClientIds = JSON.parse(decodedCookie);
            if (Array.isArray(assignedClientIds)) {
              assignedClientIds = assignedClientIds.map(id => String(id));
            } else {
              assignedClientIds = [];
            }
          } catch (error) {
            assignedClientIds = [];
          }
        }

        // If no assigned clients, return empty data
        if (assignedClientIds.length === 0) {
          const response = await originalFetcher(...args);
          if (response && response.status_code === 200 && response.data) {
            if (Array.isArray(response.data)) {
              response.data = [];
            } else {
              if (response.data.clients) response.data.clients = [];
              if (response.data.assignedClients) response.data.assignedClients = [];
              if (response.data.notAssignedClients) response.data.notAssignedClients = [];
              if (response.data.unassignedClients) response.data.unassignedClients = [];
              if (response.data.assignedToOtherPlans) response.data.assignedToOtherPlans = [];
            }
          }
          return response;
        }

        const response = await originalFetcher(...args);

        if (response && response.status_code === 200 && response.data) {
          try {
            const filterClients = (clients) => {
              if (!Array.isArray(clients)) return [];
              return clients.filter(client => {
                const clientId = String(client._id || client.id);
                return assignedClientIds.includes(clientId);
              });
            };

            if (Array.isArray(response.data)) {
              response.data = filterClients(response.data);
            } else {
              // Filter different client arrays in the response
              if (response.data.clients) {
                response.data.clients = filterClients(response.data.clients);
              }

              if (response.data.assignedClients) {
                response.data.assignedClients = filterClients(response.data.assignedClients);
              }

              if (response.data.notAssignedClients) {
                response.data.notAssignedClients = filterClients(response.data.notAssignedClients);
              }

              if (response.data.unassignedClients) {
                response.data.unassignedClients = filterClients(response.data.unassignedClients);
              }

              if (response.data.assignedToOtherPlans) {
                response.data.assignedToOtherPlans = filterClients(response.data.assignedToOtherPlans);
              }
            }
          } catch (error) {
            if (Array.isArray(response.data)) {
              response.data = [];
            } else {
              if (response.data.clients) response.data.clients = [];
              if (response.data.assignedClients) response.data.assignedClients = [];
              if (response.data.notAssignedClients) response.data.notAssignedClients = [];
              if (response.data.unassignedClients) response.data.unassignedClients = [];
              if (response.data.assignedToOtherPlans) response.data.assignedToOtherPlans = [];
            }
          }
        }

        return response;
      }

      // Default case - no filtering
      return await originalFetcher(...args);
    } catch (error) {
      return {
        status_code: 500,
        message: "Error in client filtering",
        data: []
      };
    }
  };
}

export function createFilteredFetcher(originalFetcher) {
  return withClientFilter(originalFetcher);
}
