import { fetchAPI } from "@/shared/repository/api";
import { DeliveryListResponse } from "@/shared/models/delivery";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { setUrlParams } from "@/shared/usecase/url-params";
import { getSessionClient } from "@/shared/session/get-session-client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// Type for status update payload
interface StatusUpdatePayload {
  orderId: string;
  status: string;
  note: string;
  proof_image_url: string;
}

export function useDriverDeliveries() {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const queryClient = useQueryClient();

  const query = useSearchParams();
  // Get URL parameters with defaults
  const page = query.get("page") || "1";
  const search = query.get("search") || "";
  const date = query.get("date");
  const limit = query.get("limit") || "20";
  const status = query.get("status") || "";
  const mode = query.get("mode") || "delivery";
  // Get driver_id from session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSessionClient();
        setDriverId(session.user?.id || null);
      } catch (error) {
        toast.error("Failed to fetch session");
      } finally {
        setIsSessionLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (date === "" || !date) {
      setUrlParams({ date: new Date().toISOString().split("T")[0] });
    }
  }, [date]);

  // Fetch data using React Query
  const result = useQuery({
    queryKey: [
      { key: "driverDeliveries", driverId, page, search, date, limit, status, mode },
    ],
    queryFn: async () => {
      if (!driverId) {
        return {
          data: [],
          status: "error",
          meta: { page: 0, limit: 0, totalPage: 0, totalData: 0 },
        };
      }

      // Build the query string
      let queryString = `/v1/deliveries?mode=${mode}&driver_id=${driverId}&page=${page}&limit=${limit}&q=${search}&date=${date}`;

      // Add status filter if present
      if (status) {
        queryString += `&status=${status}`;
      }

      return await fetchAPI<DeliveryListResponse>(queryString);
    },
    enabled: !isSessionLoading && driverId !== null,
  });

  // Mutation for updating delivery status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: StatusUpdatePayload) => {
      const { orderId, status, note, proof_image_url } = payload;
      return await fetchAPI(`/v1/deliveries/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note,
          proof_image_url,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the deliveries query
      queryClient.invalidateQueries({
        queryKey: [{ key: "driverDeliveries" }],
      });
      toast.success("Status berhasil diperbarui");
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status");
    },
  });

  return {
    ...result,
    isSessionLoading,
    date,
    updateStatusMutation,
  };
}
