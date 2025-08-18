import errorImage from "@/assets/error.png";
import Image from "next/image";
import { redirect } from "next/navigation";

const ErrorBoundary = ({
  children,
  error,
}: {
  children: React.ReactNode;
  error: Error | null;
}) => {
  if (error?.message === "No token found") {
    redirect("/login");
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-[12px] p-[24px]">
        <Image src={errorImage} alt="error" width={250} />
        <p className="text-[14px] font-[500] text-[#595959]">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
