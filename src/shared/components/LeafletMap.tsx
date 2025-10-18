"use client";

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  latitude: number | null;
  longitude: number | null;
  height?: string;
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  draggable?: boolean;
}

const LeafletMap = ({ 
  latitude, 
  longitude, 
  height = '300px', 
  zoom = 15,
  onLocationSelect,
  draggable = true
}: LeafletMapProps) => {
  useEffect(() => {
    // Skip map initialization if coordinates are not available
    if (!latitude || !longitude) return;

    // Make sure the map container is empty before initializing
    const container = document.getElementById('map');
    if (container) {
      container.innerHTML = '';
    }

    // Fix for Leaflet marker icon issue in Next.js
    const fixLeafletIcon = () => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    };

    fixLeafletIcon();

    // Initialize map
    const map = L.map('map').setView([latitude, longitude], zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker at the specified location
    const marker = L.marker([latitude, longitude], {
      draggable: draggable
    }).addTo(map);

    // Handle marker drag event
    if (draggable && onLocationSelect) {
      marker.on('dragend', function(e) {
        const position = e.target.getLatLng();
        onLocationSelect(position.lat, position.lng);
      });
    }

    // Handle map click event to move marker
    if (onLocationSelect) {
      map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationSelect(lat, lng);
      });
    }

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [latitude, longitude, zoom, onLocationSelect, draggable]);

  return (
    <div id="map" style={{ height, width: '100%', borderRadius: '8px' }}>
      {(!latitude || !longitude) && (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }}>
          Lokasi belum ditentukan
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
