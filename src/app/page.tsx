import { Button, Input, Select, Table } from "antd";

const Page = () => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  const data = [
    {
      key: "1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sidney No. 1 Lake Park",
    },
  ];
  return (
    <div>
      <Button type="primary">Primary</Button>
      <Button type="default">Default</Button>
      <Button type="link">Link</Button>
      <Button type="text">Text</Button>
      <Button type="dashed">Dashed</Button>
      <div className="mt-6"></div>
      <Input placeholder="Basic usage" />
      <Select placeholder="Select" options={[]} />
      <div className="mt-6"></div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Page;
