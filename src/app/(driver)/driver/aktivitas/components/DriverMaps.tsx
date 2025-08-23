"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression, divIcon } from "leaflet";
import { useDriverDeliveries } from "../repository/useDriverDelivery";
import { Delivery } from "@/shared/models/delivery";
import { Spin } from "antd";
import { getSessionClient } from "@/shared/session/get-session-client";
import mqttService from "@/shared/services/mqtt.service";

// Need to import leaflet CSS
import "leaflet/dist/leaflet.css";

// Component to handle map recenter when position changes
const RecenterMap = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
};

// Component to handle live location updates
const LocationMarker = ({
  setPosition,
  driverId,
  activeOrderId,
}: {
  setPosition: (pos: [number, number]) => void;
  driverId: string;
  activeOrderId: string | null;
}) => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let watchId: number;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition: [number, number] = [latitude, longitude];
        setLocation(newPosition);
        setPosition(newPosition);

        // Publish initial location if we have an active order
        if (activeOrderId && driverId) {
          publishDriverLocation(newPosition, driverId, activeOrderId);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );

    // Watch position for live updates
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition: [number, number] = [latitude, longitude];
        setLocation(newPosition);
        setPosition(newPosition);
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    // Set up interval to publish location every 30 seconds
    if (activeOrderId && driverId) {
      locationIntervalRef.current = setInterval(() => {
        if (location) {
          publishDriverLocation(location, driverId, activeOrderId);
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [setPosition, driverId, activeOrderId]);

  // Update location publishing when location changes
  useEffect(() => {
    if (location && activeOrderId && driverId) {
      publishDriverLocation(location, driverId, activeOrderId);
    }
  }, [location, activeOrderId, driverId]);

  // Update interval if activeOrderId changes
  useEffect(() => {
    // Clear existing interval
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    // Set up new interval if we have an active order
    if (activeOrderId && driverId && location) {
      publishDriverLocation(location, driverId, activeOrderId);

      locationIntervalRef.current = setInterval(() => {
        if (location) {
          publishDriverLocation(location, driverId, activeOrderId);
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [activeOrderId, driverId]);

  // Function to publish driver location via MQTT
  const publishDriverLocation = async (
    position: [number, number],
    driverId: string,
    orderId: string
  ) => {
    try {
      await mqttService.publishLocation(orderId, {
        driverId,
        orderId,
        timestamp: Date.now(),
        location: {
          lat: position[0],
          lng: position[1],
        },
      });
    } catch (error) {
      console.error("Failed to publish driver location:", error);
    }
  };

  if (!location) return null;

  // Use divIcon for driver marker (car emoji)
  const driverIcon = divIcon({
    className: "driver-marker-icon",
    html: `<div style="font-size: 40px; display: flex; align-items: center; justify-content: center;">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <Marker position={location} icon={driverIcon}>
      <Popup>Lokasi Anda Saat Ini</Popup>
    </Marker>
  );
};

// Main map component
const DriverMaps = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const { data, isLoading } = useDriverDeliveries();
  const [mapReady, setMapReady] = useState(false);
  const [driverId, setDriverId] = useState<string>("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Default position (Jakarta)
  const defaultPosition: LatLngExpression = [-6.2088, 106.8456];

  // Get driver ID from session
  useEffect(() => {
    const fetchDriverId = async () => {
      try {
        const session = await getSessionClient();
        if (session && session.user) {
          setDriverId(session.user_id);
        }
      } catch (error) {
        console.error("Error fetching driver ID:", error);
      }
    };

    fetchDriverId();
  }, []);

  // Filter schools that are ready for delivery or en route
  const schoolMarkers = useMemo(() => {
    if (!data?.data) return [];

    return data.data
      .filter((delivery: Delivery) => {
        // Only show schools for deliveries with status "siap diantar" or "menuju sekolah"
        return (
          delivery.status === "Siap Diantar" ||
          delivery.status === "Menuju Sekolah"
        );
      })
      .map((delivery: Delivery) => {
        const { school } = delivery;
        return {
          id: school.id,
          position: [school.latitude, school.longitude] as [number, number],
          name: school.name,
          address: school.address,
          status: delivery.status,
          orderId: delivery.order_id,
        };
      });
  }, [data?.data]);
  console.log(schoolMarkers, "marker?");

  // Find active order (Menuju Sekolah)
  useEffect(() => {
    if (schoolMarkers.length > 0) {
      const activeOrder = schoolMarkers.find(
        (marker) => marker.status === "Menuju Sekolah"
      );

      if (activeOrder) {
        setActiveOrderId(activeOrder.orderId);
      } else {
        setActiveOrderId(null);
      }
    } else {
      setActiveOrderId(null);
    }
  }, [schoolMarkers]);
  // Use divIcon for school marker (school emoji)
  const getSchoolIcon = (status: string, name: string) => {
    const emoji = status === "siap_diantar" ? "🏫" : "🏫";
    // const color = status === "siap_diantar" ? "#1677ff" : "#52c41a";

    return divIcon({
      className: "school-marker-icon",
      html: `<div style="
        font-size: 40px;
        color: white;
      ">
      <p>${emoji} </p>
      <p style="font-size: 12px; color: black; width: 80px; text-align: start">${name}</p>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Fix for Leaflet in Next.js
  useEffect(() => {
    setMapReady(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <Spin size="large" />
      </div>
    );
  }

  if (!mapReady) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mb-[24px]">
      <div
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={position || defaultPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto recenter map when position changes */}
          <RecenterMap position={position} />

          {/* Driver's live location */}
          <LocationMarker
            setPosition={setPosition}
            driverId={driverId}
            activeOrderId={activeOrderId}
          />

          {/* School markers */}
          {schoolMarkers.map((marker) => (
            <Marker
              key={marker.orderId}
              position={marker.position}
              icon={getSchoolIcon(marker.status, marker.name)}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{marker.name}</h3>
                  <p>{marker.address}</p>
                  <p className="mt-2">
                    <span className="font-semibold">Status:</span>{" "}
                    {marker.status === "siap_diantar"
                      ? "Siap Diantar"
                      : "Menuju Sekolah"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DriverMaps;
