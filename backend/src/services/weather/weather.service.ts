export async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: { "User-Agent": "KrishiMitra-Agriculture-AI/1.0" },
    });
    const data = await res.json() as any;
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.county || "Cuttack";
      const district = data.address.state_district || data.address.county || data.address.city || "Cuttack";
      const state = data.address.state || "Odisha";
      return { city, district, state };
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode fallback to default");
  }
  return { city: "Cuttack", district: "Cuttack", state: "Odisha" };
}

export async function getWeatherData(lat: number, lon: number, city: string = "Cuttack") {
  const current = {
    temp: 29,
    condition: "Sunny & Humid",
    humidity: 78,
    windSpeed: 12,
    rainfallChance: 15,
    city: city || "Cuttack",
  };

  const forecast = [
    { day: "Today", temp: current.temp, condition: "Partly Cloudy", rain: 20, advisory: "Favorable for weeding and pesticide application." },
    { day: "Tomorrow", temp: 31, condition: "Sunny", rain: 10, advisory: "Good day for fertilizer application." },
    { day: "Day 3", temp: 28, condition: "Light Rain", rain: 60, advisory: "Ensure good drainage in paddy fields." },
    { day: "Day 4", temp: 30, condition: "Cloudy", rain: 30, advisory: "Ideal for soil preparation." },
    { day: "Day 5", temp: 32, condition: "Sunny & Warm", rain: 5, advisory: "Irrigation advised for vegetable crops." },
  ];

  return {
    current,
    forecast,
    advisory: "Favorable weather for field preparation and weeding. No heavy rainfall expected.",
  };
}
