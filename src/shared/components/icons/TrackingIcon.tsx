import trackingActive from "@/assets/tracking-active.png";
import trackingInactive from "@/assets/tracking-active.png";
import Image from "next/image";

const TrackingIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? trackingActive : trackingInactive}
        alt="tracking"
        width={24}
        height={24}
      />
    </div>
  );
};

export default TrackingIcon;
