"use client";

import { Card, Row, Col, Statistic } from "antd";
import { CarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getSessionClient } from "@/shared/session/get-session-client";

export default function DriverDashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSessionClient();
        setUserName(sessionData.user?.fullname || "Driver");
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  // These would be replaced with actual data from an API in a real implementation
  const deliveryStats = {
    total: 24,
    completed: 18,
    pending: 6
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium">
          {isLoading ? "Loading..." : `Welcome, ${userName}`}
        </h1>
        <p className="text-gray-500">Here's your delivery overview</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Total Deliveries Today" 
              value={deliveryStats.total} 
              prefix={<CarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Completed" 
              value={deliveryStats.completed} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Pending" 
              value={deliveryStats.pending} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-6">
        <Card title="Recent Activity">
          <p>View your recent deliveries in the Aktivitas section.</p>
          <p className="mt-2">
            <a href="/driver/aktivitas" className="text-blue-500 hover:underline">
              Go to Aktivitas →
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
