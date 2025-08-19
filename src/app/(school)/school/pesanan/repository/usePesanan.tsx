import { IListPesanan } from "@/shared/models/pesanan";
import { fetchAPI } from "@/shared/repository/api";
import { getSessionClient } from "@/shared/session/get-session-client";
import { getUrlParams } from "@/shared/usecase/url-params";
import { useQuery } from "@tanstack/react-query";

export function useListPesanan() {
  const page = getUrlParams("page") || "1";
  const search = getUrlParams("search") || "";
  const status = getUrlParams("status") || "";

  return useQuery({
    queryKey: [{ key: "pesanan", page, search, status }],
    queryFn: async () => {
      const page = getUrlParams("page") || "1";
      const search = getUrlParams("search") || "";
      const status = getUrlParams("status") || "";

      const session = await getSessionClient();
      const schoolId = session.user?.school_id || "";

      let url = `/v1/orders?school_id=${schoolId}&page=${page}`;

      if (search) {
        url += `&q=${search}`;
      }

      if (status) {
        url += `&status=${status}`;
      }

      return await fetchAPI<IListPesanan>(url);
    },
  });
}
