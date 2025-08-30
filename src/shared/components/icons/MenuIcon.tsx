import menuActive from "@/assets/menu-active.png";
import menuInactive from "@/assets/menu-inactive.png";
import Image from "next/image";

const MenuIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? menuActive : menuInactive}
        alt="menu"
        width={24}
        height={24}
      />
    </div>
  );
};

export default MenuIcon;
