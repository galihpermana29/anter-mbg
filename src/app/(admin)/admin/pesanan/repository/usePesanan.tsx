import { IListPesanan } from "@/shared/models/pesanan";
import { fetchAPI } from "@/shared/repository/api";
import { useQuery } from "@tanstack/react-query";
import { getUrlParams } from "@/shared/usecase/url-params";

const tableLimit = 10;
export function useListPesanan() {
  const page = getUrlParams("page") || 1;
  const search = getUrlParams("search") || "";
  const status = getUrlParams("status") || "";

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      {
        key: "pesanan",
        page,
        search,
      },
    ],
    queryFn: async ({ signal }) => {
      const page = getUrlParams("page") || 1;
      const search = getUrlParams("search") || "";
      const status = getUrlParams("status") || "";

      const response = await fetchAPI<IListPesanan>(
        `/v1/orders?limit=${tableLimit}&page=${page}&q=${search}&status=${status}`,
        {
          signal,
        }
      );

      return response;
    },
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    error,
    refetch,
  };
}
