import statistikActive from "@/assets/statistik-active.png";
import statistikInactive from "@/assets/statistik-inactive.png";
import Image from "next/image";

const StatistikIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? statistikActive : statistikInactive}
        alt="statistik"
        width={24}
        height={24}
      />
    </div>
  );
};

export default StatistikIcon;
