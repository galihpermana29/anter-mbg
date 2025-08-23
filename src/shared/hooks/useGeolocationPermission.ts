import { useState, useEffect } from "react";

type GeolocationPermissionState = "prompt" | "granted" | "denied";

interface UseGeolocationPermissionReturn {
  permission: GeolocationPermissionState;
  isChecking: boolean;
  requestPermission: () => void;
}

export const useGeolocationPermission = (): UseGeolocationPermissionReturn => {
  const [permission, setPermission] = useState<GeolocationPermissionState>("prompt");
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkGeolocationPermission = async () => {
      setIsChecking(true);
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          setPermission("denied");
          setIsChecking(false);
          return;
        }

        // Check permission status if available
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({
            name: "geolocation",
          });
          setPermission(result.state as GeolocationPermissionState);

          // Listen for permission changes
          result.addEventListener("change", () => {
            setPermission(result.state as GeolocationPermissionState);
          });
        } else {
          // Fallback for browsers that don't support permissions API
          // Try to get position to trigger permission prompt
          navigator.geolocation.getCurrentPosition(
            () => setPermission("granted"),
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                setPermission("denied");
              } else {
                setPermission("prompt");
              }
            }
          );
        }
      } catch (error) {
        console.error("Error checking geolocation permission:", error);
        setPermission("denied");
      } finally {
        setIsChecking(false);
      }
    };

    checkGeolocationPermission();
  }, []);

  // Request geolocation permission
  const requestPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setPermission("granted"),
        (error) => {
          console.error("Error getting location:", error);
          setPermission("denied");
        }
      );
    }
  };

  return {
    permission,
    isChecking,
    requestPermission
  };
};
