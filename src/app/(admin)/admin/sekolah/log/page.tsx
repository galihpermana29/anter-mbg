"use client";

import { Button, Image, Table, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import useLogSekolah, { useExportLogSekolah } from "./repository/useLogSekolah";
import { setUrlParams } from "@/shared/usecase/url-params";
import { formatDate } from "@/shared/utils/date-formatter";
import * as XLSX from "xlsx";

const LogSekolah = () => {
  const router = useRouter();
  const query = useSearchParams();

  // id and school name
  const id = query.get("id");
  const schoolName = query.get("school_name");

  const { data, isLoading, refetch } = useLogSekolah();
  const { data: exportData, isLoading: isExporting, refetch: refetchExport } = useExportLogSekolah();

  // XLSX Export functionality
  const handleExportXLSX = async () => {
    try {
      await refetchExport();

      if (exportData?.data) {
        // Format data for XLSX export based on table columns
        const xlsxData = exportData.data.map((item: any) => ({
          'ID Pesanan': item.order_id,
          'Bukti URL': item.image_url || 'No Image',
          'Waktu': formatDate(item.date),
          'Rating': item.rating,
          'Catatan': item.notes || '-',
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(xlsxData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Log Sekolah');

        // Generate filename with current date and school name
        const filename = `log-sekolah-${schoolName || 'unknown'}-${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        message.success('Data exported successfully!');
      }
    } catch (error) {
      message.error('Failed to export data');
    }
  };

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
        <Image
          src={text}
          alt="proof"
          width={100}
          height={100}
          style={{ objectFit: "cover" }}
        />
        // <img
        //   src={text}
        //   alt="proof"
        //   style={{ width: "100px", height: "100px" }}
        // />
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

      <div className="flex justify-between items-center mb-[24px]">
        <div>
          <h1 className="text-[24px] font-[500]">Log Sekolah</h1>
          <h1 className="text-[24px] font-[500] mt-[12px]">{schoolName}</h1>
        </div>
        <Button
          type="default"
          onClick={handleExportXLSX}
          loading={isExporting}
        >
          Export Excel
        </Button>
      </div>

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
