import DashboardLayout from "@/shared/components/DashboardLayout";

const LayoutAdmin = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
    </>
  );
};

export default LayoutAdmin;
