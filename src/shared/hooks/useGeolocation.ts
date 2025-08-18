import { useState, useCallback } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  };
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: {
      latitude: null,
      longitude: null,
      address: null,
    },
  });

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id', // Get results in Indonesian
            'User-Agent': 'AnterMBG Dashboard' // Required by Nominatim usage policy
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      return data.display_name || 'Alamat tidak ditemukan';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Alamat tidak ditemukan';
    }
  };

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Get address from coordinates
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        setState({
          loading: false,
          error: null,
          position: {
            latitude,
            longitude,
            address,
          },
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { ...state, getCurrentPosition };
};
