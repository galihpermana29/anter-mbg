import { fetchAPI } from "@/shared/repository/api";
import { DeliveryListResponse } from "@/shared/models/delivery";
import { useQuery } from "@tanstack/react-query";
import { getUrlParams, setUrlParams } from "@/shared/usecase/url-params";
import { getSessionClient } from "@/shared/session/get-session-client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function useSchoolDeliveries() {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const query = useSearchParams();
  // Get URL parameters with defaults
  const page = query.get("page") || "1";
  const search = query.get("search") || "";
  const date = query.get("date");
  const limit = query.get("limit") || "20";
  const status = query.get("status") || "";

  // Get school_id from session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSessionClient();
        setSchoolId(session.user?.school_id || null);
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
      { key: "schoolDeliveries", schoolId, page, search, date, limit, status },
    ],
    queryFn: async () => {
      if (!schoolId) {
        return {
          data: [],
          status: "error",
          meta: { page: 0, limit: 0, totalPage: 0, totalData: 0 },
        };
      }

      // Build the query string
      let queryString = `/v1/deliveries?mode=delivery&school_id=${schoolId}&page=${page}&limit=${limit}&q=${search}&date=${date}`;

      // Add status filter if present
      if (status) {
        queryString += `&status=${status}`;
      }

      return await fetchAPI<DeliveryListResponse>(queryString);
    },
    enabled: !isSessionLoading && schoolId !== null,
  });

  return {
    ...result,
    isSessionLoading,
    date,
  };
}
