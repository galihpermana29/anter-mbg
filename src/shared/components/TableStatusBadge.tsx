import { Badge } from "antd";

const TableStatusBadge = ({ status }: { status: string }) => {
  if (status === "Siap Diantar") {
    return <Badge count={status} color="blue" />;
  }

  if (status === "Makanan Diterima") {
    return <Badge count={status} color="green" />;
  }

  if (status === "Makanan Diantar") {
    return <Badge count={status} color="orange" />;
  }

  if (status === "Menuju Sekolah") {
    return <Badge count={status} color="pink" />;
  }

  if (status === "Pending") {
    return <Badge count={status} color="purple" />;
  }

  return <Badge count={status} color="gray" />;
};

export default TableStatusBadge;
