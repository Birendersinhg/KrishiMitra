export interface SoilLayerState {
  depthRange: string;
  moisturePercent: number;
  temperatureCelsius: number;
  compactionStatus: string;
  organicCarbonPercent: number;
}

export interface DigitalTwinState {
  farmerId: string;
  farmName: string;
  district: string;
  state: string;
  plotSizeAcres: number;
  primaryCrop: string;
  growthStage: string;
  daysSincePlanting: number;
  soilProfile: {
    pH: number;
    topsoilMoisturePercent: number; // 0-5cm
    subsoilMoisturePercent: number; // 10-30cm
    nitrogenKgHa: number;
    phosphorusKgHa: number;
    potassiumKgHa: number;
    electricalConductivityDsM: number;
    layers: SoilLayerState[];
  };
  cropCanopy: {
    ndviIndex: number; // 0.0 - 1.0
    leafAreaIndex: number;
    canopyTemperatureCelsius: number;
    biomassKgHa: number;
    chlorophyllContentSpad: number;
    stressStatus: "Optimal" | "Mild Water Stress" | "Nutrient Deficient" | "Severe Stress";
  };
  microclimate: {
    ambientTempCelsius: number;
    relativeHumidityPercent: number;
    vaporPressureDeficitKPa: number;
    dailyEvapotranspirationMm: number;
    solarRadiationMjM2: number;
  };
  lastUpdated: string;
}

export interface TelemetryPoint {
  timestamp: string;
  ndvi: number;
  moisture10cm: number;
  canopyTemp: number;
  et0: number;
}

// In-memory dynamic digital twin state cache with temporal telemetry history
const twinStore: Record<string, { state: DigitalTwinState; history: TelemetryPoint[] }> = {};

function initDefaultTwin(farmerId: string): { state: DigitalTwinState; history: TelemetryPoint[] } {
  const state: DigitalTwinState = {
    farmerId,
    farmName: "Paddy Agro-Eco Plot #4",
    district: "Cuttack",
    state: "Odisha",
    plotSizeAcres: 3.5,
    primaryCrop: "Paddy (Swarna Sub-1)",
    growthStage: "Tillering Stage (Active Vegetative)",
    daysSincePlanting: 38,
    soilProfile: {
      pH: 6.4,
      topsoilMoisturePercent: 32.5,
      subsoilMoisturePercent: 38.0,
      nitrogenKgHa: 275,
      phosphorusKgHa: 24,
      potassiumKgHa: 310,
      electricalConductivityDsM: 0.42,
      layers: [
        {
          depthRange: "0 - 5 cm (Topsoil)",
          moisturePercent: 32.5,
          temperatureCelsius: 28.4,
          compactionStatus: "Optimal Loose Tilth",
          organicCarbonPercent: 0.72,
        },
        {
          depthRange: "5 - 15 cm (Root Zone)",
          moisturePercent: 38.0,
          temperatureCelsius: 26.8,
          compactionStatus: "Firm Rooting Zone",
          organicCarbonPercent: 0.65,
        },
        {
          depthRange: "15 - 30 cm (Subsoil)",
          moisturePercent: 41.2,
          temperatureCelsius: 25.1,
          compactionStatus: "Clayey Substrata",
          organicCarbonPercent: 0.48,
        },
      ],
    },
    cropCanopy: {
      ndviIndex: 0.76,
      leafAreaIndex: 3.8,
      canopyTemperatureCelsius: 27.2,
      biomassKgHa: 3450,
      chlorophyllContentSpad: 42.5,
      stressStatus: "Optimal",
    },
    microclimate: {
      ambientTempCelsius: 29.8,
      relativeHumidityPercent: 76,
      vaporPressureDeficitKPa: 1.15,
      dailyEvapotranspirationMm: 4.6,
      solarRadiationMjM2: 18.4,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Generate 7-day retrospective telemetry history
  const history: TelemetryPoint[] = [];
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000);
    const dayNoise = Math.sin(i * 1.5) * 0.04;
    history.push({
      timestamp: d.toISOString().split("T")[0],
      ndvi: Number((0.68 + (6 - i) * 0.015 + dayNoise).toFixed(3)),
      moisture10cm: Number((39.0 - (i % 3) * 2.5 + Math.random()).toFixed(1)),
      canopyTemp: Number((26.5 + (i % 2) * 1.2).toFixed(1)),
      et0: Number((4.2 + (i % 3) * 0.3).toFixed(1)),
    });
  }

  return { state, history };
}

export function getDigitalTwin(farmerId: string = "farmer-demo-1") {
  if (!twinStore[farmerId]) {
    twinStore[farmerId] = initDefaultTwin(farmerId);
  }
  return twinStore[farmerId];
}

export function updateDigitalTwin(farmerId: string, updates: Partial<DigitalTwinState>) {
  const twin = getDigitalTwin(farmerId);
  twin.state = {
    ...twin.state,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  return twin.state;
}

export function simulateSensorPulse(farmerId: string = "farmer-demo-1") {
  const twin = getDigitalTwin(farmerId);
  const s = twin.state;

  // Add subtle sensor drift
  const tempDelta = (Math.random() - 0.48) * 0.6;
  const moistureDelta = (Math.random() - 0.52) * 0.8;
  const ndviDelta = (Math.random() - 0.45) * 0.01;

  s.soilProfile.topsoilMoisturePercent = Math.max(15, Math.min(50, Number((s.soilProfile.topsoilMoisturePercent + moistureDelta).toFixed(1))));
  s.soilProfile.subsoilMoisturePercent = Math.max(20, Math.min(55, Number((s.soilProfile.subsoilMoisturePercent + moistureDelta * 0.5).toFixed(1))));
  s.soilProfile.layers[0].moisturePercent = s.soilProfile.topsoilMoisturePercent;
  s.soilProfile.layers[1].moisturePercent = s.soilProfile.subsoilMoisturePercent;

  s.cropCanopy.ndviIndex = Math.max(0.1, Math.min(0.95, Number((s.cropCanopy.ndviIndex + ndviDelta).toFixed(3))));
  s.cropCanopy.canopyTemperatureCelsius = Number((s.cropCanopy.canopyTemperatureCelsius + tempDelta).toFixed(1));
  s.microclimate.ambientTempCelsius = Number((s.microclimate.ambientTempCelsius + tempDelta * 1.1).toFixed(1));
  s.lastUpdated = new Date().toISOString();

  // Determine stress status
  if (s.soilProfile.topsoilMoisturePercent < 22) {
    s.cropCanopy.stressStatus = "Mild Water Stress";
  } else if (s.cropCanopy.ndviIndex < 0.5) {
    s.cropCanopy.stressStatus = "Nutrient Deficient";
  } else {
    s.cropCanopy.stressStatus = "Optimal";
  }

  // Push to history
  const todayStr = new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().slice(0, 5);
  twin.history.push({
    timestamp: todayStr,
    ndvi: s.cropCanopy.ndviIndex,
    moisture10cm: s.soilProfile.subsoilMoisturePercent,
    canopyTemp: s.cropCanopy.canopyTemperatureCelsius,
    et0: s.microclimate.dailyEvapotranspirationMm,
  });

  if (twin.history.length > 30) {
    twin.history.shift();
  }

  return { state: s, latestPoint: twin.history[twin.history.length - 1] };
}
