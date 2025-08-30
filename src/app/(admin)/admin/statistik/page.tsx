"use client";

import SekolahIcon from "@/shared/components/icons/SekolahIcon";
import StatistikNumber from "./component/StatistikNumber";
import StatistikPercent from "./component/StatistikPercent";
import {
  useSekolahStatistik,
  usePesananStatistik,
} from "./repository/useStatistik";
import PesananIcon from "@/shared/components/icons/PesananIcon";
import DeliveryIcon from "@/shared/components/icons/DeliveryIcon";
import StatistikIcon from "@/shared/components/icons/Statistik";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

const defStats = {
  count: 0,
  portions: 0,
  percentage: 0,
};

const StatistikPage = () => {
  const { data, isLoading, error, refetch } = useSekolahStatistik();

  const {
    data: pesananData,
    isLoading: pesananLoading,
    error: pesananError,
    refetch: pesananRefetch,
  } = usePesananStatistik();

  return (
    <ErrorBoundary error={error || pesananError}>
      <div>
        <div className="flex items-center gap-[8px]">
          <StatistikIcon isActive={true} />
          <h1 className="text-[24px] font-[500]">Statistik</h1>
        </div>
        <div>
          <div className="flex items-center gap-[8px]">
            <SekolahIcon isActive={true} />
            <h1 className="text-[#595959] text-[20px] my-[12px] font-[500]">
              Sekolah
            </h1>
          </div>

          <StatistikNumber
            title="Total Sekolah"
            number={data?.data.total_school_all.toString() || "0"}
          />

          <div className="mt-[20px] grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            <StatistikNumber
              title="TK/PAUD"
              number={data?.data.total_school_tk.toString() || "0"}
            />
            <StatistikNumber
              title="SD/MI"
              number={data?.data.total_school_sd.toString() || "0"}
            />
            <StatistikNumber
              title="SMP/MTs"
              number={data?.data.total_school_smp.toString() || "0"}
            />
            <StatistikNumber
              title="SMA/MA/SMK"
              number={data?.data.total_school_sma.toString() || "0"}
            />
          </div>
        </div>

        <div className="my-[32px]">
          <div className="flex items-center gap-[8px]">
            <PesananIcon isActive={true} />
            <h1 className="text-[#595959] text-[20px] my-[12px] font-[500]">
              Pesanan
            </h1>
          </div>

          <div className="mt-[20px] grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            <StatistikNumber
              title="Total Pesanan"
              number={pesananData?.data.total_orders.toString() || "0"}
            />
            <StatistikNumber
              title="Total Porsi"
              number={pesananData?.data.total_portions.toString() || "0"}
            />
          </div>
        </div>

        <div className="my-[32px]">
          <div className="flex items-center gap-[8px]">
            <DeliveryIcon isActive={true} />
            <h1 className="text-[#595959] text-[20px] my-[12px] font-[500]">
              Pengantaran
            </h1>
          </div>

          <div className="mt-[20px] grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            <StatistikPercent
              data={pesananData?.data.delivery.pending || defStats}
              status="Belum Diantar"
            />
            <StatistikPercent
              data={pesananData?.data.delivery.ready_for_delivery || defStats}
              status="Siap Diantar"
            />
            <StatistikPercent
              data={pesananData?.data.delivery.out_for_delivery || defStats}
              status="Diantar"
            />
            <StatistikPercent
              data={pesananData?.data.delivery.delivered || defStats}
              status="Diterima"
            />
          </div>
        </div>
        <div className="my-[32px]">
          <div className="flex items-center gap-[8px]">
            <DeliveryIcon isActive={true} />
            <h1 className="text-[#595959] text-[20px] my-[12px] font-[500]">
              Pengambilan
            </h1>
          </div>

          <div className="mt-[20px] grid grid-cols-2 md:grid-cols-4 gap-[16px]">
            <StatistikPercent
              data={pesananData?.data.pickup.ready_for_pickup || defStats}
              status="Piring Siap Diambil"
            />
            <StatistikPercent
              data={pesananData?.data.pickup.out_for_pickup || defStats}
              status="Mengambil Piring"
            />
            <StatistikPercent
              data={pesananData?.data.pickup.pickup_completed || defStats}
              status="Pengambilan Selesai"
            />
            <StatistikPercent
              data={pesananData?.data.pickup.cancelled || defStats}
              status="Batal"
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StatistikPage;
