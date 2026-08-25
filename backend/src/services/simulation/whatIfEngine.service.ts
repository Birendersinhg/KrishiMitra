export interface SimulationParameters {
  tempDeltaCelsius: number; // e.g. -3 to +6
  drySpellDays: number; // 0 to 30 days
  rainfallExcessMm: number; // 0 to 100 mm deluge
  irrigationPercent: number; // 0% (Rainfed) to 200%
  nitrogenDosagePercent: number; // -50% to +50%
  pestPressure: "Low" | "Moderate" | "High" | "Severe Outbreak";
  crop: string;
}

export interface DailyProjectionPoint {
  day: number;
  dateStr: string;
  projectedTemp: number;
  soilMoisture10cmPercent: number;
  wiltingPointThresholdPercent: number;
  projectedNdvi: number;
  baselineNdvi: number;
  stressFactorPercent: number;
}

export interface SimulationResult {
  params: SimulationParameters;
  predictedYieldImpactPercent: number; // e.g. -18.5% or +4.2%
  predictedProfitDeltaInrPerAcre: number; // e.g. -?4200
  cropStressIndex: "Low / Healthy" | "Moderate Stress" | "Severe Drought Stress" | "Flood Waterlogging" | "Thermal Scorching";
  riskScore: number; // 0 - 100
  dailyProjections: DailyProjectionPoint[];
  biophysicalBreakdown: {
    thermalStressLossPercent: number;
    moistureDeficitLossPercent: number;
    nitrogenImbalanceLossPercent: number;
    pestDamageLossPercent: number;
  };
  preventativeActionPlan: string[];
}

export function runWhatIfSimulation(params: SimulationParameters): SimulationResult {
  const {
    tempDeltaCelsius = 2,
    drySpellDays = 7,
    rainfallExcessMm = 0,
    irrigationPercent = 100,
    nitrogenDosagePercent = 0,
    pestPressure = "Moderate",
    crop = "Paddy",
  } = params;

  // 1. Calculate biophysical stress losses
  // Thermal stress: > 3?C delta causes pollen sterility / enzyme denaturation
  const thermalStressLossPercent = Math.max(0, tempDeltaCelsius * (tempDeltaCelsius > 2 ? 3.8 : 1.5));

  // Moisture stress: dry spell without adequate irrigation
  const effectiveIrrigationFactor = irrigationPercent / 100;
  const drySpellStress = Math.max(0, (drySpellDays - 4) * 1.8) * Math.max(0.2, 1.2 - effectiveIrrigationFactor * 0.8);
  const excessWaterStress = rainfallExcessMm > 40 ? (rainfallExcessMm - 40) * 0.25 : 0;
  const moistureDeficitLossPercent = Number((drySpellStress + excessWaterStress).toFixed(1));

  // Nitrogen penalty (deficiency < 0 causes chlorosis, excess > 20% increases lodging and insect susceptibility)
  let nitrogenImbalanceLossPercent = 0;
  if (nitrogenDosagePercent < 0) {
    nitrogenImbalanceLossPercent = Math.abs(nitrogenDosagePercent) * 0.35;
  } else if (nitrogenDosagePercent > 20) {
    nitrogenImbalanceLossPercent = (nitrogenDosagePercent - 20) * 0.25;
  }

  // Pest damage
  const pestFactors: Record<string, number> = {
    Low: 1.5,
    Moderate: 6.0,
    High: 14.5,
    "Severe Outbreak": 28.0,
  };
  const pestDamageLossPercent = pestFactors[pestPressure] || 6.0;

  // Net yield impact
  const totalLoss = thermalStressLossPercent + moistureDeficitLossPercent + nitrogenImbalanceLossPercent + pestDamageLossPercent;
  let predictedYieldImpactPercent = -Number(totalLoss.toFixed(1));

  // Positive boost if optimal cooling or optimal irrigation
  if (tempDeltaCelsius <= 0 && drySpellDays <= 3 && irrigationPercent >= 100 && pestPressure === "Low") {
    predictedYieldImpactPercent = +4.5;
  }

  // Financial impact (Assuming average gross revenue ?28,000 / acre for Paddy/Vegetables in Odisha)
  const baseRevenue = 28000;
  const predictedProfitDeltaInrPerAcre = Math.round((predictedYieldImpactPercent / 100) * baseRevenue);

  // Determine stress index
  let cropStressIndex: SimulationResult["cropStressIndex"] = "Low / Healthy";
  if (rainfallExcessMm > 50) {
    cropStressIndex = "Flood Waterlogging";
  } else if (tempDeltaCelsius >= 4) {
    cropStressIndex = "Thermal Scorching";
  } else if (drySpellDays >= 10 && irrigationPercent < 60) {
    cropStressIndex = "Severe Drought Stress";
  } else if (totalLoss > 12) {
    cropStressIndex = "Moderate Stress";
  }

  const riskScore = Math.min(100, Math.max(5, Math.round(totalLoss * 1.8)));

  // Generate 14-day daily projection time series
  const dailyProjections: DailyProjectionPoint[] = [];
  const baseTemp = 30 + tempDeltaCelsius;
  let currentMoisture = 38.0;
  const wiltingPoint = 18.0; // Critical threshold for root wilting

  for (let d = 1; d <= 14; d++) {
    const dDate = new Date(Date.now() + d * 24 * 3600 * 1000);
    const dateStr = `Day ${d} (${dDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })})`;

    // Daily soil moisture decay physics
    const dailyEt = 4.5 + tempDeltaCelsius * 0.4;
    const dailyLoss = (dailyEt / 10) * (d <= drySpellDays ? 1.4 : 0.8);
    const dailyIrrig = (irrigationPercent / 100) * (d % 3 === 0 ? 3.5 : 0);
    currentMoisture = Math.max(12, Number((currentMoisture - dailyLoss + dailyIrrig).toFixed(1)));

    // NDVI projection
    const baselineNdvi = Number((0.74 + Math.sin(d / 4) * 0.04).toFixed(3));
    const stressPenalty = Math.max(0, (wiltingPoint - currentMoisture) * 0.015) + (tempDeltaCelsius > 2 ? 0.04 : 0);
    const projectedNdvi = Number(Math.max(0.2, baselineNdvi - stressPenalty).toFixed(3));

    const stressFactorPercent = Number(Math.min(100, ((baselineNdvi - projectedNdvi) / baselineNdvi) * 100 + (totalLoss * (d / 14))).toFixed(1));

    dailyProjections.push({
      day: d,
      dateStr,
      projectedTemp: Number((baseTemp + Math.sin(d) * 1.2).toFixed(1)),
      soilMoisture10cmPercent: currentMoisture,
      wiltingPointThresholdPercent: wiltingPoint,
      projectedNdvi,
      baselineNdvi,
      stressFactorPercent,
    });
  }

  // Pre-emptive Action Plan
  const preventativeActionPlan: string[] = [];
  if (tempDeltaCelsius >= 3) {
    preventativeActionPlan.push("Apply foliar Potassium Silicate (2 mL/L) or Salicylic Acid to induce plant thermal shock tolerance.");
    preventativeActionPlan.push("Schedule sprinkler misting during peak solar radiation (12:00 PM - 2:30 PM) to reduce microclimate canopy temp by 3?C.");
  }
  if (drySpellDays >= 7 && irrigationPercent < 100) {
    preventativeActionPlan.push("Apply straw mulch (3-4 cm thickness) across field beds to reduce soil moisture evaporation by up to 35%.");
    preventativeActionPlan.push("Prioritize deficit root-zone drip irrigation during early dawn to minimize evaporative losses.");
  }
  if (rainfallExcessMm >= 30) {
    preventativeActionPlan.push("Open secondary drainage canals at field corners to prevent standing water stagnation exceeding 48 hours.");
    preventativeActionPlan.push("Apply prophylactic bio-fungicide Trichoderma drench after rain to prevent root-rot complex.");
  }
  if (preventativeActionPlan.length === 0) {
    preventativeActionPlan.push("Maintain standard agronomic regime: steady Alternate Wetting and Drying (AWD) water table and balanced NPK schedule.");
  }

  return {
    params,
    predictedYieldImpactPercent,
    predictedProfitDeltaInrPerAcre,
    cropStressIndex,
    riskScore,
    dailyProjections,
    biophysicalBreakdown: {
      thermalStressLossPercent: Number(thermalStressLossPercent.toFixed(1)),
      moistureDeficitLossPercent: Number(moistureDeficitLossPercent.toFixed(1)),
      nitrogenImbalanceLossPercent: Number(nitrogenImbalanceLossPercent.toFixed(1)),
      pestDamageLossPercent: Number(pestDamageLossPercent.toFixed(1)),
    },
    preventativeActionPlan,
  };
}
