import { message } from "antd";

const useMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const successNotification = ({ content }: { content: string }) => {
    messageApi.open({
      type: "success",
      content,
    });
  };

  const errorNotification = ({ content }: { content: string }) => {
    messageApi.open({
      type: "error",
      content,
    });
  };

  const warningNotification = ({ content }: { content: string }) => {
    messageApi.open({
      type: "warning",
      content,
    });
  };

  const loadingNotification = ({ content }: { content: string }) => {
    messageApi.open({
      type: "loading",
      content,
    });
  };
  return {
    messageApi,
    contextHolder,
    successNotification,
    errorNotification,
    warningNotification,
    loadingNotification,
  };
};

export default useMessage;
