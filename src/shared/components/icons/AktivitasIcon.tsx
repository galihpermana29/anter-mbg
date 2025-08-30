import activitasActive from "@/assets/activity-active.png";
import activitasInactive from "@/assets/activity-inactive.png";
import Image from "next/image";

const AktivitasIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? activitasActive : activitasInactive}
        alt="aktivitas"
        width={24}
        height={24}
      />
    </div>
  );
};

export default AktivitasIcon;
