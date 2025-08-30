import deliveryActive from "@/assets/delivery-active.png";
import deliveryInactive from "@/assets/delivery-active.png";
import Image from "next/image";

const DeliveryIcon = ({ isActive }: { isActive: boolean }) => {
  return (
    <div>
      <Image
        src={isActive ? deliveryActive : deliveryInactive}
        alt="delivery"
        width={24}
        height={24}
      />
    </div>
  );
};

export default DeliveryIcon;
