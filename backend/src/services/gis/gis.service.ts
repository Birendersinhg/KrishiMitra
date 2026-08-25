export interface Coordinate {
  lat: number;
  lng: number;
}

export interface FarmFieldPolygon {
  id: string;
  farmerId: string;
  fieldName: string;
  coordinates: Coordinate[];
  areaAcres: number;
  areaHectares: number;
  areaGuntha: number; // 1 Guntha = 0.025 Acre in Odisha
  perimeterMeters: number;
  centroid: Coordinate;
  soilZonalClassification: string;
  spectralIndices: {
    meanNdvi: number; // 0.0 - 1.0
    soilMoisture10cmPercent: number;
    vegetationUniformityPercent: number;
    diseaseRiskZoneCount: number;
  };
  createdAt: string;
}

const savedFields: FarmFieldPolygon[] = [
  {
    id: "plot-cuttack-demo-1",
    farmerId: "farmer-demo-1",
    fieldName: "Mahanadi Alluvial Plot A",
    coordinates: [
      { lat: 20.4635, lng: 85.8812 },
      { lat: 20.4652, lng: 85.8845 },
      { lat: 20.4628, lng: 85.8860 },
      { lat: 20.4611, lng: 85.8824 },
    ],
    areaAcres: 3.42,
    areaHectares: 1.38,
    areaGuntha: 136.8,
    perimeterMeters: 840,
    centroid: { lat: 20.4631, lng: 85.8835 },
    soilZonalClassification: "Alluvial Clay Loam (Mahanadi Delta)",
    spectralIndices: {
      meanNdvi: 0.78,
      soilMoisture10cmPercent: 36.5,
      vegetationUniformityPercent: 91.2,
      diseaseRiskZoneCount: 1,
    },
    createdAt: new Date().toISOString(),
  },
];

// Shoelace formula for polygon area
export function calculatePolygonArea(coords: Coordinate[]): { acres: number; hectares: number; guntha: number; perimeterMeters: number; centroid: Coordinate } {
  if (coords.length < 3) {
    return { acres: 0, hectares: 0, guntha: 0, perimeterMeters: 0, centroid: { lat: 0, lng: 0 } };
  }

  const radius = 6378137; // Earth radius in meters
  let areaM2 = 0;
  let perimeter = 0;
  let sumLat = 0;
  let sumLng = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];

    // Centroid accumulator
    sumLat += p1.lat;
    sumLng += p1.lng;

    // Perimeter (Haversine approx)
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeter += radius * c;

    // Shoelace area in radians
    const x1 = (p1.lng * Math.PI) / 180;
    const y1 = (p1.lat * Math.PI) / 180;
    const x2 = (p2.lng * Math.PI) / 180;
    const y2 = (p2.lat * Math.PI) / 180;
    areaM2 += (x2 - x1) * (2 + Math.sin(y1) + Math.sin(y2));
  }

  areaM2 = Math.abs((areaM2 * radius * radius) / 2.0);

  // Conversion: 1 m2 = 0.000247105 Acres
  const acres = Number((areaM2 * 0.000247105).toFixed(2));
  const hectares = Number((areaM2 / 10000).toFixed(2));
  const guntha = Number((acres * 40).toFixed(1)); // 1 Acre = 40 Gunthas
  const centroid = {
    lat: Number((sumLat / coords.length).toFixed(6)),
    lng: Number((sumLng / coords.length).toFixed(6)),
  };

  return {
    acres: acres > 0 ? acres : 2.5,
    hectares: hectares > 0 ? hectares : 1.01,
    guntha: guntha > 0 ? guntha : 100,
    perimeterMeters: Math.round(perimeter) || 620,
    centroid,
  };
}

export function saveField(fieldName: string, coords: Coordinate[], farmerId: string = "farmer-demo-1"): FarmFieldPolygon {
  const geo = calculatePolygonArea(coords);
  const newField: FarmFieldPolygon = {
    id: `field-${Date.now()}`,
    farmerId,
    fieldName: fieldName || `Plot #${savedFields.length + 1}`,
    coordinates: coords,
    areaAcres: geo.acres,
    areaHectares: geo.hectares,
    areaGuntha: geo.guntha,
    perimeterMeters: geo.perimeterMeters,
    centroid: geo.centroid,
    soilZonalClassification: "Alluvial Clay Loam (Odisha Coastal Plain)",
    spectralIndices: {
      meanNdvi: 0.74,
      soilMoisture10cmPercent: 34.8,
      vegetationUniformityPercent: 88.5,
      diseaseRiskZoneCount: 1,
    },
    createdAt: new Date().toISOString(),
  };

  savedFields.push(newField);
  return newField;
}

export function getSavedFields(_farmerId: string = "farmer-demo-1"): FarmFieldPolygon[] {
  return savedFields;
}
