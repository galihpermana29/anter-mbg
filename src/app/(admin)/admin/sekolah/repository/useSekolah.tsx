import { IListSekolah } from "@/shared/models/sekolah";
import { fetchAPI } from "@/shared/repository/api";
import { getUrlParams } from "@/shared/usecase/url-params";
import { useQuery } from "@tanstack/react-query";

const tableLimit = 10;

const useListSekolah = () => {
  const page = getUrlParams("page") || 1;
  const search = getUrlParams("search") || "";
  const category = getUrlParams("category") || "";

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      {
        key: "sekolah",
        page,
        search,
        category,
      },
    ],
    queryFn: async ({ signal }) => {
      const page = getUrlParams("page") || 1;
      const search = getUrlParams("search") || "";
      const category = getUrlParams("category") || "";

      const response = await fetchAPI<IListSekolah>(
        `/v1/schools?limit=${tableLimit}&page=${page}&q=${search}&category=${category}`,
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
};

export default useListSekolah;
