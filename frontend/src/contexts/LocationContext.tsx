import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface LocationContextType {
  latitude: number | null;
  longitude: number | null;
  city: string;
  district: string;
  state: string;
  loading: boolean;
  error: string | null;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({
  latitude: null,
  longitude: null,
  city: "Cuttack",
  district: "Cuttack",
  state: "Odisha",
  loading: true,
  error: null,
  refreshLocation: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState("Cuttack");
  const [district, setDistrict] = useState("Cuttack");
  const [state, setState] = useState("Odisha");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGeoDetails = async (lat: number, lon: number) => {
    try {
      const res = await api.get(`/weather/geocode?lat=${lat}&lon=${lon}`);
      if (res.data.success && res.data.location) {
        setCity(res.data.location.city || "Cuttack");
        setDistrict(res.data.location.district || "Cuttack");
        setState(res.data.location.state || "Odisha");
      }
    } catch (err) {
      console.warn("Reverse geocode fallback to default location");
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        fetchGeoDetails(lat, lon);
      },
      (err) => {
        console.warn("Geolocation permission not granted or unavailable, using Odisha defaults:", err.message);
        setLatitude(20.4625);
        setLongitude(85.8828);
        setCity("Cuttack");
        setDistrict("Cuttack");
        setState("Odisha");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        latitude,
        longitude,
        city,
        district,
        state,
        loading,
        error,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
