export interface AgentProposal {
  agentName: string;
  agentRole: "Agronomy" | "Meteorology" | "Hydrology" | "Economics";
  avatar: string;
  stanceSummary: string;
  recommendation: string;
  priorityWeight: number; // 1-10
  risksIdentified: string[];
}

export interface AgentDebateRound {
  roundNumber: number;
  speaker: string;
  targetAgent: string;
  critique: string;
  concessionOrCounter: string;
}

export interface ConsensusOutput {
  dilemma: string;
  farmerContext: {
    crop: string;
    location: string;
    stage: string;
    budgetLevel: string;
  };
  proposals: AgentProposal[];
  debateTranscript: AgentDebateRound[];
  consensusVerdict: {
    consensusScore: number; // 0-100%
    arbiterSummary: string;
    actionPlan: string[];
    tradeOffAnalysis: {
      yieldVsWater: string;
      costVsEffectiveness: string;
      shortTermVsSoilHealth: string;
    };
    riskMitigationChecklist: string[];
  };
  timestamp: string;
}

export const PRESET_DILEMMAS = [
  {
    id: "heatwave_water_stress",
    title: "Impending 38?C Heatwave with 40% Canal Water Deficit",
    crop: "Paddy (Swarna Sub-1)",
    dilemma: "Weather forecasts predict a 5-day heatwave (38?C) during active tillering, but canal water is rationed. Agronomist wants flood irrigation to prevent panicle blast, Hydrologist demands deficit irrigation, and Economist warns against diesel pump costs.",
  },
  {
    id: "pest_vs_organic_budget",
    title: "Brown Planthopper (BPH) Attack on Marginal Budget",
    crop: "Paddy",
    dilemma: "Early BPH nymph clusters detected at hill bases. Agronomist recommends chemical Triflumezopyrim 10% SC, Economist flags that chemical is ?1,400/bottle (beyond budget), and Hydrologist suggests field drainage to suppress hopper reproduction.",
  },
  {
    id: "pre_monsoon_fertilizer_timing",
    title: "Basal Fertilizer Application Ahead of Unseasonal Rainfall",
    crop: "Vegetables / Mustard",
    dilemma: "Farmer wants to broadcast DAP & Urea today, but Meteorology agent predicts 45mm convective thunderstorm in 36 hours which may cause nitrogen runoff and eutrophication.",
  },
];

export async function runMultiAgentDeliberation(customDilemma?: string, cropName: string = "Paddy", district: string = "Cuttack"): Promise<ConsensusOutput> {
  const dilemmaText = customDilemma || "How to optimize nitrogen top-dressing and irrigation schedule given high humidity (82%) and rising day temperatures in Cuttack?";

  const proposals: AgentProposal[] = [
    {
      agentName: "Dr. Arundhati Mishra (Agronomy & Crop Health)",
      agentRole: "Agronomy",
      avatar: "??",
      stanceSummary: "Maximize photosynthetic yield and protect vegetative canopy with targeted nitrogen & bio-fungicides.",
      recommendation: "Apply split-dose Urea (30 kg/acre) mixed with 5 kg Zinc Sulfate to boost leaf area index. Spray prophylactic bio-fungicide Pseudomonas fluorescens (10g/L) due to high humidity blast risk.",
      priorityWeight: 9,
      risksIdentified: [
        "Excessive nitrogen in humid conditions accelerates bacterial blight.",
        "Delayed application will permanently restrict tiller count.",
      ],
    },
    {
      agentName: "Col. Sanjeev Mohanty (Meteorology & Climate Risk)",
      agentRole: "Meteorology",
      avatar: "???",
      stanceSummary: "Mitigate unseasonal convective thunderstorm and temperature surge risk.",
      recommendation: "Satellite telemetry shows convective cloud buildup over Coastal Odisha within 48h. Postpone foliar broadcasting by 2 days until rainfall probability drops below 30% to prevent runoff loss.",
      priorityWeight: 8,
      risksIdentified: [
        "Rainfall runoff will wash away ?800 worth of surface-applied fertilizers into drainage canals.",
        "Post-rain leaf wetness exceeds 10 hours, creating optimal spore germination conditions.",
      ],
    },
    {
      agentName: "Er. Pravat Nayak (Hydrology & Irrigation)",
      agentRole: "Hydrology",
      avatar: "??",
      stanceSummary: "Conserve ground water and maintain Alternate Wetting and Drying (AWD) threshold.",
      recommendation: "Root zone 10cm moisture is currently at 38% (optimal field capacity). Do not flood field. Maintain 2-3cm thin water film only, allowing soil to breathe between wetting cycles to save 25% water.",
      priorityWeight: 7,
      risksIdentified: [
        "Continuous flooding causes root asphyxiation and methane emissions.",
        "Over-irrigation in heavy soils creates localized salinity accumulation.",
      ],
    },
    {
      agentName: "Prof. Binod Das (Agro-Economics & Farmer Budget)",
      agentRole: "Economics",
      avatar: "??",
      stanceSummary: "Protect marginal smallholder net profit margin and input affordability.",
      recommendation: "Substitute 25% synthetic chemical urea with fermented Farm Yard Manure / Jeevamrutha slurry to cut input costs by ?650/acre while securing equal biological response.",
      priorityWeight: 8,
      risksIdentified: [
        "Farmer has limited liquid cash reserves for expensive proprietary chemical inputs.",
        "High cost of diesel pumping (?95/hr) reduces seasonal profit margin by 14%.",
      ],
    },
  ];

  const debateTranscript: AgentDebateRound[] = [
    {
      roundNumber: 1,
      speaker: "Meteorology Agent",
      targetAgent: "Agronomy Agent",
      critique: "Agronomy is advocating for immediate broadcasting today, but our radar detects localized thunderstorm convective cells arriving in 36 hours. All your urea will be lost in runoff!",
      concessionOrCounter: "Agronomy concedes that broadcasting should be delayed until the cloud front passes on Day 3, but insists the field must not undergo nitrogen starvation.",
    },
    {
      roundNumber: 2,
      speaker: "Hydrology Agent",
      targetAgent: "Economics Agent",
      critique: "Economics wants organic slurry drenching, but slurry application during AWD drying cycle can crust topsoil if not properly incorporated with light soil working.",
      concessionOrCounter: "Economics agrees to recommend shallow harrowing before slurry incorporation, minimizing crusting while maintaining zero-cost organic fertility.",
    },
    {
      roundNumber: 3,
      speaker: "Consensus Arbiter",
      targetAgent: "All Agents",
      critique: "Synthesizing constraints: Agronomy's yield targets must be met without triggering Meteorology's runoff risk or violating Hydrology's AWD water thresholds and Economics' budget cap.",
      concessionOrCounter: "All agents adopt the 3-step Unified Action Plan with 94% consensus confidence.",
    },
  ];

  return {
    dilemma: dilemmaText,
    farmerContext: {
      crop: cropName,
      location: `${district}, Odisha`,
      stage: "Active Vegetative (Tillering)",
      budgetLevel: "Marginal / Smallholder (?2,500 budget cap)",
    },
    proposals,
    debateTranscript,
    consensusVerdict: {
      consensusScore: 94,
      arbiterSummary: "Unanimous synthesis achieved: Postpone fertilizer broadcasting by 48 hours to avoid thunderstorm runoff, apply reduced urea + zinc combo incorporated with FYM for cost-savings, and maintain Alternate Wetting and Drying (AWD) water regime.",
      actionPlan: [
        "Day 1-2: Hold off on surface fertilizer application; clear field bund drainage outlets to manage forecasted rain.",
        "Day 3 (Post-Rain): Apply Split Urea @ 20 kg/acre + 5 kg Zinc Sulfate blended with well-decomposed FYM.",
        "Day 4: Spray bio-agent Pseudomonas fluorescens (10g/L) during late afternoon to shield against humidity-triggered fungal blast.",
        "Irrigation Protocol: Adopt Alternate Wetting and Drying (AWD) ? allow water table to drop 5cm below soil surface before next shallow 3cm irrigation.",
      ],
      tradeOffAnalysis: {
        yieldVsWater: "AWD irrigation delivers 98.5% of max yield potential while cutting total water usage by 24.8%.",
        costVsEffectiveness: "Blended organic FYM + split inorganic urea saves ?680/acre with zero yield penalty.",
        shortTermVsSoilHealth: "Bio-fungicide prevents leaf scorch and enhances long-term rhizosphere microbial diversity.",
      },
      riskMitigationChecklist: [
        "Inspect field 24 hours after rainfall for standing water pooling.",
        "Verify absence of yellowing leaf tips before secondary top-dressing.",
        "Monitor soil moisture with field tube (AWD pipe) twice weekly.",
      ],
    },
    timestamp: new Date().toISOString(),
  };
}
