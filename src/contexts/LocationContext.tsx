import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; district: string; state: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "User-Agent": "KrishiMitra-Agriculture-AI/1.0" } }
    );
    const data = await res.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
      const district = data.address.state_district || data.address.county || data.address.city || "";
      const state = data.address.state || "";
      return { city, district, state };
    }
  } catch (err) {
    console.warn("Reverse geocode failed, using defaults");
  }
  return { city: "Cuttack", district: "Cuttack", state: "Odisha" };
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState("Cuttack");
  const [district, setDistrict] = useState("Cuttack");
  const [state, setState] = useState("Odisha");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        const loc = await reverseGeocode(lat, lon);
        setCity(loc.city || "Unknown City");
        setDistrict(loc.district || loc.city || "Unknown District");
        setState(loc.state || "");
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation permission denied, using defaults:", err.message);
        // Use Odisha defaults when location permission is denied
        setLatitude(20.4625);
        setLongitude(85.8828);
        setCity("Cuttack");
        setDistrict("Cuttack");
        setState("Odisha");
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

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
