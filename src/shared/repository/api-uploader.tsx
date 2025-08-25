import axios, { AxiosProgressEvent } from "axios";

export async function uploadImageWithApi(
  formData: FormData,
  openNotification?: (progress: number, key: any, isError?: boolean) => void,
  key?: any
) {
  // using axios
  try {
    const response = await axios.post(
      `https://memorify-api-staging.up.railway.app/api/v1/uploads`,
      formData,
      {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          openNotification?.(percentCompleted, key);
        },
      }
    );
    return {
      message: "success",
      data: response.data,
      success: true,
    };
  } catch (error) {
    openNotification?.(0, key, true);
    return {
      message: "Failed to upload image",
      success: false,
    };
  }
}
