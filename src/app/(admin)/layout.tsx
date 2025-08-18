import DashboardLayout from "@/shared/components/DashboardLayout";
import { Suspense } from "react";

const LayoutAdmin = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardLayout>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </DashboardLayout>
    </>
  );
};

export default LayoutAdmin;
