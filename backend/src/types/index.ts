export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface StructuredCropDiagnosis {
  crop: string;
  healthStatus: "HEALTHY" | "NEEDS_ATTENTION" | "CRITICAL" | "UNKNOWN";
  disease: {
    name: string;
    confidence: number;
    description: string;
  } | null;
  pest: {
    name: string;
    confidence: number;
    description: string;
  } | null;
  pathogen: string | null;
  nutrientDeficiency: {
    possible: boolean;
    nutrient: string;
    symptoms: string;
  } | null;
  soilAnalysis?: {
    estimatedTexture: string;
    moistureEstimate: string;
    deficiencyRisk: string;
  } | null;
  severity: "Low" | "Medium" | "High" | "None";
  farmerExplanation: string;
  immediateActions: string[];
  recommendations: string[];
  weatherAdvice: string;
  safetyDisclaimer: string;
  suggestedProductTags: string[];
}

export interface WeatherData {
  city: string;
  district: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  weatherCondition: string;
  weatherDescription: string;
  icon: string;
  rainProbability: number;
  forecast: Array<{
    date: string;
    day: string;
    tempDay: number;
    tempNight: number;
    condition: string;
    description: string;
    rainProbability: number;
    icon: string;
    farmingTip: string;
  }>;
  agriculturalAdvisory: string[];
}
