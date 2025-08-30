import { IResponseLogSekolah } from "@/shared/models/sekolah";
import { fetchAPI } from "@/shared/repository/api";
import { getUrlParams } from "@/shared/usecase/url-params";
import { useQuery } from "@tanstack/react-query";

const tableLimit = 10;

const useLogSekolah = () => {
  const page = getUrlParams("page") || 1;
  const search = getUrlParams("search") || "";
  const schoolId = getUrlParams("id") || "";

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      {
        key: "log-sekolah",
        page,
        search,
        schoolId,
      },
    ],
    queryFn: async ({ signal }) => {
      const page = getUrlParams("page") || 1;
      const schoolId = getUrlParams("id") || "";

      const response = await fetchAPI<IResponseLogSekolah>(
        `/v1/schools/food-logs?limit=${tableLimit}&page=${page}&school_id=${schoolId}`,
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

export default useLogSekolah;
