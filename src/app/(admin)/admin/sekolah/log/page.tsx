"use client";

import { Table } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import useLogSekolah from "./repository/useLogSekolah";
import { setUrlParams } from "@/shared/usecase/url-params";
import { formatDate } from "@/shared/utils/date-formatter";

const LogSekolah = () => {
  const router = useRouter();
  const query = useSearchParams();

  // id and school name
  const id = query.get("id");
  const schoolName = query.get("school_name");

  const { data, isLoading, refetch } = useLogSekolah();

  const column = [
    {
      title: "ID Pesanan",
      dataIndex: "order_id",
      render: (text: string) => <span className="line-clamp-2">{text}</span>,
      width: 200,
    },
    {
      title: "Bukti",
      dataIndex: "image_url",
      render: (text: string) => (
        <img
          src={text}
          alt="proof"
          style={{ width: "100px", height: "100px" }}
        />
      ),
    },
    {
      title: "Waktu",
      dataIndex: "date",
      render: (text: string) => <span>{formatDate(text)}</span>,
    },
    {
      title: "Rating",
      dataIndex: "rating",
    },
    {
      title: "Catatan",
      dataIndex: "notes",
    },
  ];

  return (
    <div>
      <h1 className="text-[24px] font-[500]">Log Sekolah</h1>
      <h1 className="text-[24px] font-[500] mt-[12px]">{schoolName}</h1>

      <div className="mt-[20px]">
        <Table
          columns={column}
          dataSource={data?.data}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            total: data?.meta.totalData,
            onChange: (page) => {
              setUrlParams({ page });
              refetch();
            },
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default LogSekolah;
