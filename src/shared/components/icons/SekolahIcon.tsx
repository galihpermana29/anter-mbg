import Image from "next/image";
import sekolahActive from "@/assets/sekolah-active.png";
import sekolahInactive from "@/assets/sekolah-inactive.png";

const SekolahIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? sekolahActive : sekolahInactive}
        alt="sekolah"
        width={24}
        height={24}
      />
    </div>
  );
};

export default SekolahIcon;
