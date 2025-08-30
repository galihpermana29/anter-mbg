import Image from "next/image";
import pesananActive from "@/assets/pesanan-active.png";
import pesananInactive from "@/assets/pesanan-inactive.png";
const PesananIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? pesananActive : pesananInactive}
        alt="pesanan"
        width={24}
        height={24}
      />
    </div>
  );
};

export default PesananIcon;
