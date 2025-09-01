"use client";

import { useSearchParams } from "next/navigation";
import { useGetDetailOrderById } from "../repository/usePesanan";
import ClientSideKitchenMap from "../component/ClientSideKitchenMap";
import { Card, Spin, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";

const LiveTrackPage = () => {
  const query = useSearchParams();
  const orderId = query.get("id");

  const { data, isLoading, error } = useGetDetailOrderById(orderId || "");

  return (
    <div className="">
      <div className="mb-4">
        <Link
          href="/admin/aktivitas"
          className="flex items-center text-blue-500 hover:underline"
        >
          <ArrowLeftOutlined className="mr-2" /> Kembali ke Daftar Aktivitas
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Live Tracking Pesanan</h1>

      {error ? (
        <Alert
          message="Error"
          description="Gagal memuat data pesanan. Silakan coba lagi nanti."
          type="error"
          showIcon
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Informasi Pesanan" className="mb-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spin tip="Loading..." />
              </div>
            ) : data?.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Order ID:</strong> {data.data.order_id}
                  </p>
                  <p>
                    <strong>Status:</strong> {data.data.status}
                  </p>
                  <p>
                    <strong>Sekolah:</strong> {data.data.school.name}
                  </p>
                  <p>
                    <strong>Alamat:</strong> {data.data.school.address}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Driver:</strong>{" "}
                    {data.data.driver?.name || "Belum ditugaskan"}
                  </p>
                  <p>
                    <strong>Antar Sebelum:</strong> {data.data.deliver_before}
                  </p>
                  <p>
                    <strong>Porsi:</strong> {data.data.portion}
                  </p>
                </div>
              </div>
            ) : (
              <p>Tidak ada data pesanan</p>
            )}
          </Card>

          <div>
            <ClientSideKitchenMap
              orderData={data?.data}
              isLoading={isLoading}
            />
            <div className="mt-4 text-sm text-gray-500">
              <p>🚗 - Lokasi Driver</p>
              <p>🏫 - Lokasi Sekolah</p>
              <p>🍳 - Lokasi Dapur</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackPage;
