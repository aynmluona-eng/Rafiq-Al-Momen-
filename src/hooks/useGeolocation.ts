import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
  isCustom: boolean;
}

interface UseGeolocationOptions {
  ignoreCustom?: boolean;
}

export function useGeolocation(options?: UseGeolocationOptions) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    isCustom: false,
  });

  useEffect(() => {
    const fetchLocation = () => {
      if (!options?.ignoreCustom) {
        const customLocationStr = localStorage.getItem('custom_location');
        if (customLocationStr) {
          try {
            const customLoc = JSON.parse(customLocationStr);
            if (customLoc.id !== 'auto') {
              setState({
                location: {
                  latitude: customLoc.lat,
                  longitude: customLoc.lng,
                  name: customLoc.name,
                },
                error: null,
                loading: false,
                isCustom: true,
              });
              return;
            }
          } catch (e) {
            console.error("Failed to parse custom location", e);
          }
        }
      }

      if (!navigator.geolocation) {
        setState({
          location: null,
          error: 'Geolocation is not supported by your browser',
          loading: false,
          isCustom: false,
        });
        return;
      }

      const handleSuccess = (position: GeolocationPosition) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
          isCustom: false,
        });
      };

      const handleError = (error: GeolocationPositionError) => {
        setState({
          location: null,
          error: error.message,
          loading: false,
          isCustom: false,
        });
      };

      setState(s => ({ ...s, loading: true }));
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    };

    fetchLocation();

    const handleLocationChanged = () => {
      fetchLocation();
    };

    window.addEventListener('location_changed', handleLocationChanged);
    return () => window.removeEventListener('location_changed', handleLocationChanged);
  }, [options?.ignoreCustom]);

  return state;
}
