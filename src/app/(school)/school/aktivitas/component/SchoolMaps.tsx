"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression, divIcon } from "leaflet";
import { Spin } from "antd";
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

interface LocationData {
  driverId: string;
  orderId: string;
  timestamp: number;
  location: {
    lat: number;
    lng: number;
  };
  heading?: number;
  speed?: number;
}

// Main map component
const SchoolMaps = ({
  orderId,
  schoolPosition,
}: {
  orderId: string;
  schoolPosition?: [number, number];
}) => {
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(
    null
  );
  const [mapReady, setMapReady] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Default position (Jakarta)
  const defaultPosition: LatLngExpression = [-6.2088, 106.8456];

  // Subscribe to driver location updates
  useEffect(() => {
    console.log(orderId, "order?");
    if (!orderId) return;

    // Subscribe to driver location updates
    const subscribeToDriverLocation = async () => {
      try {
        console.log("subscribe???");
        // Unsubscribe from previous subscription if exists
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        // Subscribe to new topic
        const unsubscribe = mqttService.subscribeToDriverLocation(
          orderId,
          (data: LocationData) => {
            console.log(data, "data subscribe?");
            if (data.location && data.location.lat && data.location.lng) {
              setDriverPosition([data.location.lat, data.location.lng]);
            }
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error("Error subscribing to driver location:", error);
      }
    };

    subscribeToDriverLocation();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [orderId]);

  // Fix for Leaflet in Next.js
  useEffect(() => {
    setMapReady(true);
  }, []);

  // Driver icon
  const driverIcon = divIcon({
    className: "driver-marker-icon",
    html: `<div style="font-size: 40px; display: flex; align-items: center; justify-content: center;">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // School icon
  const schoolIcon = divIcon({
    className: "school-marker-icon",
    html: `<div style="
      font-size: 40px;
      color: white;
    ">
    <p>🏫</p>
    <p style="font-size: 12px; color: black; width: 80px; text-align: start">Sekolah</p>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  if (!mapReady) {
    return (
      <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-lg">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mb-[24px]">
      <div
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={driverPosition || schoolPosition || defaultPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto recenter map when driver position changes */}
          <RecenterMap position={driverPosition} />

          {/* Driver's live location */}
          {driverPosition && (
            <Marker position={driverPosition} icon={driverIcon}>
              <Popup>Lokasi Driver</Popup>
            </Marker>
          )}

          {/* School location */}
          {schoolPosition && (
            <Marker position={schoolPosition} icon={schoolIcon}>
              <Popup>Lokasi Sekolah</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default SchoolMaps;
