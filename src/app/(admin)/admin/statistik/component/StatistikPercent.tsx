import { Stats } from "@/shared/models/pesanan";
import { parseStringStats } from "@/shared/utils/function";
import { Progress } from "antd";

const StatistikPercent = ({
  data,
  status,
}: {
  data: Stats;
  status: string;
}) => {
  return (
    <div className="border-[1px] border-[#D3D3D3] py-[14px] px-[10px] rounded-[14px] flex flex-col justify-center items-center text-center">
      <Progress
        strokeWidth={15}
        strokeColor={"#FF9314"}
        type="dashboard"
        percent={Math.round(data.percentage)}
      />
      <div>
        <h1 className="text-[14px] font-[500] my-[8px]">{status}</h1>
        <p className="text-[#000000D9] font-[500] text-[24px]">
          {parseStringStats(data.count.toString())}{" "}
          <span className="text-[14px] font-[400]">Pesanan</span>
        </p>
        <p className="text-[12px] font-[400] mt-[5px] text-[#000000D9]">
          Total Porsi: {parseStringStats(data.portions.toString())}
        </p>
      </div>
    </div>
  );
};

export default StatistikPercent;
