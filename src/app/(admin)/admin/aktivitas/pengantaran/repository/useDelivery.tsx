import { fetchAPI } from "@/shared/repository/api";
import {
  AssignDriverPayload,
  DeliveryListResponse,
  DriverOption,
  DriverListResponse,
} from "@/shared/models/delivery";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { setUrlParams } from "@/shared/usecase/url-params";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useListDeliveries() {
  // Get URL parameters with defaults
  const query = useSearchParams();

  const page = query.get("page") || "1";
  const search = query.get("search") || "";
  const date = query.get("date"); // Default to today's date
  const limit = query.get("limit") || "20";
  const status = query.get("status") || "";

  useEffect(() => {
    if (date === "" || !date) {
      setUrlParams({ date: new Date().toISOString().split("T")[0] });
    }
  }, [date]);

  // Fetch data using React Query
  const result = useQuery({
    queryKey: [{ key: "deliveries", page, search, date, limit, status }],
    queryFn: async () => {
      // Build the query string
      let queryString = `/v1/deliveries?mode=delivery&page=${page}&limit=${limit}&q=${search}&date=${date}`;

      // Add status filter if present
      if (status) {
        queryString += `&status=${status}`;
      }

      return await fetchAPI<DeliveryListResponse>(queryString);
    },
  });

  return {
    ...result,
    date,
  };
}

// Fetch driver options from API
export function useDriverOptions() {
  return useQuery({
    queryKey: ["driverOptions"],
    queryFn: async () => {
      const response = await fetchAPI<DriverListResponse>(
        "/v1/users?role=DRIVER&page=1&limit=50"
      );

      // Map API response to DriverOption format
      const drivers: DriverOption[] = response.data.map((driver) => ({
        id: driver.id,
        name: driver.fullname,
      }));

      return drivers;
    },
  });
}

// Function to assign a driver to an order
export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignDriverPayload) => {
      // Call the actual API endpoint
      return await fetchAPI<{ success: boolean }>(
        `/v1/deliveries/${data.order_id}/assign-driver`,
        {
          method: "PUT",
          body: JSON.stringify({
            driver_id: data.driver_id,
          }),
        }
      );
    },
    onSuccess: () => {
      toast.success("Driver assigned successfully");
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [{ key: "deliveries" }] });
    },
    onError: () => {
      toast.error("Failed to assign driver");
    },
  });
}
