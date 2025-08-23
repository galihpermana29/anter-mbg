"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { LatLngExpression, divIcon } from "leaflet";
import { Spin } from "antd";
import mqttService from "@/shared/services/mqtt.service";
import "leaflet/dist/leaflet.css";
import { Delivery } from "@/shared/models/delivery";

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

// Component to handle driver location updates via MQTT
const DriverLocationMarker = ({ orderId }: { orderId: string }) => {
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(
    null
  );
  const [driverInfo, setDriverInfo] = useState<{
    driverId: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // Subscribe to driver location updates
    const unsubscribe = mqttService.subscribeToDriverLocation(
      orderId,
      (data) => {
        console.log("Received driver location:", data);
        if (data && data.location) {
          setDriverPosition([data.location.lat, data.location.lng]);
          setDriverInfo({
            driverId: data.driverId,
            timestamp: data.timestamp,
          });
        }
      }
    );

    return () => {
      // Unsubscribe when component unmounts
      unsubscribe();
    };
  }, [orderId]);

  if (!driverPosition) return null;

  // Use divIcon for driver marker (car emoji)
  const driverIcon = divIcon({
    className: "driver-marker-icon",
    html: `<div style="font-size: 40px; display: flex; align-items: center; justify-content: center;">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  return (
    <Marker position={driverPosition} icon={driverIcon}>
      <Popup>
        <div>
          <p>
            <strong>Driver ID:</strong> {driverInfo?.driverId}
          </p>
          <p>
            <strong>Last Update:</strong>{" "}
            {driverInfo
              ? new Date(driverInfo.timestamp).toLocaleTimeString()
              : "Unknown"}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

interface KitchenMapProps {
  orderData: Delivery | undefined;
  isLoading: boolean;
}

interface SchoolLocation {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

interface KitchenLocation {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const KitchenMap = ({ orderData, isLoading }: KitchenMapProps) => {
  const [mapReady, setMapReady] = useState(false);
  const [kitchenPosition, setKitchenPosition] = useState<
    [number, number] | null
  >(null);
  const [schoolPosition, setSchoolPosition] = useState<[number, number] | null>(
    null
  );

  // Default position (Jakarta)
  const defaultPosition: LatLngExpression = [-6.2088, 106.8456];

  // Set school position from order data
  useEffect(() => {
    if (orderData && orderData.school) {
      // Create school location object from order data
      const schoolLocation: SchoolLocation = {
        latitude: orderData.school.latitude,
        longitude: orderData.school.longitude,
        name: orderData.school.name,
        address: orderData.school.address,
      };

      console.log("Using school coordinates from API:", schoolLocation);
      setSchoolPosition([schoolLocation.latitude, schoolLocation.longitude]);
    }
  }, [orderData]);

  // Set kitchen position from current user location (kitchen owner)
  useEffect(() => {
    if (orderData) {
      // Create kitchen location object from order data
      const kitchenLocation: KitchenLocation = {
        latitude: 0,
        longitude: 0,
        name: "", // Kitchen name not available in Delivery model
        address: "",
      };

      // Get current user location as kitchen position
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            kitchenLocation.latitude = latitude;
            kitchenLocation.longitude = longitude;
            setKitchenPosition([
              kitchenLocation.latitude,
              kitchenLocation.longitude,
            ]);
          },
          (error) => {
            console.error("Error getting kitchen location:", error);
            // Fallback to default position
            kitchenLocation.latitude = -6.2088 + 0.01;
            kitchenLocation.longitude = 106.8456 + 0.01;
            setKitchenPosition([
              kitchenLocation.latitude,
              kitchenLocation.longitude,
            ]);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        // Fallback for browsers that don't support geolocation
        kitchenLocation.latitude = -6.2088 + 0.01;
        kitchenLocation.longitude = 106.8456 + 0.01;
        setKitchenPosition([
          kitchenLocation.latitude,
          kitchenLocation.longitude,
        ]);
      }
    }
  }, [orderData]);

  // Use divIcon for school marker (school emoji)
  const schoolIcon = divIcon({
    className: "school-marker-icon",
    html: `<div style="
      font-size: 40px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    ">🏫</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  // Use divIcon for kitchen marker (kitchen emoji)
  const kitchenIcon = divIcon({
    className: "kitchen-marker-icon",
    html: `<div style="
      font-size: 40px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    ">🍳</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin tip="Loading map data..." />
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full relative">
      <MapContainer
        center={kitchenPosition || defaultPosition}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto recenter map when school position changes */}
        {schoolPosition && <RecenterMap position={schoolPosition} />}

        {/* Driver's live location from MQTT */}
        {orderData && <DriverLocationMarker orderId={orderData.order_id} />}

        {/* School marker */}
        {schoolPosition && (
          <Marker position={schoolPosition} icon={schoolIcon}>
            <Popup>
              <div>
                <h3 className="font-bold">
                  {orderData?.school?.name || "School"}
                </h3>
                <p>{orderData?.school?.address || ""}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Kitchen marker */}
        {kitchenPosition && (
          <Marker position={kitchenPosition} icon={kitchenIcon}>
            <Popup>
              <div>
                <h3 className="font-bold">Dapur</h3>
                <p>Dapur</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default KitchenMap;
