import { parseStringStats } from "@/shared/utils/function";

const StatistikNumber = ({
  title,
  number,
}: {
  title: string;
  number: string;
}) => {
  return (
    <div className="p-[10px] shadow-xs">
      <h1 className="text-[14px] text-[#03030373] mb-[4px] font-[400]">
        {title}
      </h1>
      <p className="text-[24px] text-[#030303D9] font-[400]">
        {parseStringStats(number)}
      </p>
    </div>
  );
};

export default StatistikNumber;
