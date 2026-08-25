export interface AgronomyChunk {
  id: string;
  sourceDoc: string;
  publisher: string;
  chapterOrSection: string;
  cropOrDomain: string;
  text: string;
  keywords: string[];
}

export const AGRONOMY_CORPUS: AgronomyChunk[] = [
  {
    id: "ouat_paddy_blast_2024",
    sourceDoc: "Package of Practices for Kharif Crops in Odisha (OUAT)",
    publisher: "Odisha University of Agriculture & Technology, Bhubaneswar",
    chapterOrSection: "Section 2.4: Fungal Diseases of Lowland Rice",
    cropOrDomain: "Paddy / Rice",
    text: "Paddy Blast caused by Magnaporthe oryzae is aggravated by excessive nitrogen application and continuous leaf wetness (>90% RH). Control: Spray Tricyclazole 75% WP @ 0.6 g/litre of water or Isoprothiolane 40% EC @ 1.5 ml/litre. Organic management includes seed treatment and prophylactic spray with Pseudomonas fluorescens @ 10 g/litre at 15-day intervals.",
    keywords: ["blast", "paddy", "tricyclazole", "pseudomonas", "fungicide", "nitrogen", "spores"],
  },
  {
    id: "icar_nrri_bph_2023",
    sourceDoc: "ICAR-NRRI Rice Crop Protection Manual",
    publisher: "National Rice Research Institute, Cuttack",
    chapterOrSection: "Chapter 5: Management of Brown Planthopper (Nilaparvata lugens)",
    cropOrDomain: "Paddy / Rice",
    text: "Brown Planthopper (BPH) causes hopper burn in dense rice canopies. For moderate infestations, adopt Alternate Wetting and Drying (AWD) water management to desiccate hopper eggs. Recommended chemicals: Triflumezopyrim 10% SC @ 94 ml/acre or Pymetrozine 50% WG @ 120 g/acre. Strictly avoid synthetic pyrethroids which cause BPH resurgence.",
    keywords: ["bph", "brown planthopper", "hopper", "pymetrozine", "triflumezopyrim", "nrri", "resurgence"],
  },
  {
    id: "ouat_tomato_blight_2024",
    sourceDoc: "OUAT Horticulture Extension Guidelines: Solanaceous Crops",
    publisher: "Directorate of Extension, OUAT Bhubaneswar",
    chapterOrSection: "Chapter 7: Tomato Early & Late Blight Management",
    cropOrDomain: "Tomato",
    text: "Early blight (Alternaria solani) causes target spot lesions on leaves. Spray Mancozeb 75% WP @ 2.0-2.5 g/L or Chlorothalonil 75% WP @ 2.0 g/L. For organic farming, spray neem oil (10,000 ppm) @ 3 ml/L or bio-fungicide Trichoderma harzianum @ 5 g/L as soil drench and foliar spray.",
    keywords: ["tomato", "early blight", "alternaria", "mancozeb", "chlorothalonil", "trichoderma", "neem"],
  },
  {
    id: "icar_soil_acidity_odisha_2023",
    sourceDoc: "Soil Health Management in Acidic Soils of Eastern India",
    publisher: "ICAR Indian Institute of Soil Science & Directorate of Agriculture, Odisha",
    chapterOrSection: "Chapter 3: Amelioration of Red and Laterite Acid Soils",
    cropOrDomain: "Soil Health / Chemistry",
    text: "Over 70% of cultivated soils in Odisha are acidic (pH 4.8 - 6.2) leading to phosphorus fixation and aluminum/iron toxicity. Apply agricultural lime (CaCO3) or paper mill sludge @ 0.2 lime requirement (approx 2.5-3.0 quintals/acre) every 3 years. Use Rock Phosphate or DAP supplemented with Farm Yard Manure (FYM) to maximize phosphorus availability.",
    keywords: ["soil", "acidity", "ph", "lime", "calcium", "phosphorus", "fym", "laterite", "odisha"],
  },
  {
    id: "fao_integrated_weed_mgmt",
    sourceDoc: "FAO Climate-Smart Agriculture Manual for Smallholders",
    publisher: "Food and Agriculture Organization (FAO) of the United Nations",
    chapterOrSection: "Module 4: Sustainable Weed and Moisture Conservation",
    cropOrDomain: "Weed & Water Management",
    text: "Mechanical cono-weeding in System of Rice Intensification (SRI) incorporates weeds into the soil as green manure, increasing soil aeration and root proliferation. Pre-emergence herbicide Pretilachlor 50% EC @ 500 ml/acre applied within 3 days of transplanting provides broad-spectrum control without harming earthworm populations.",
    keywords: ["weeds", "pretilachlor", "cono-weeder", "sri", "fao", "aeration", "herbicide"],
  },
];

export function queryAgronomyKnowledge(query: string, limit: number = 3) {
  const qTokens = query.toLowerCase().split(/[\s,.-]+/).filter((t) => t.length > 2);

  // Compute token overlap similarity score
  const scored = AGRONOMY_CORPUS.map((chunk) => {
    let score = 0;
    const chunkText = (chunk.text + " " + chunk.cropOrDomain + " " + chunk.keywords.join(" ")).toLowerCase();

    for (const token of qTokens) {
      if (chunk.keywords.some((k) => k.includes(token))) score += 4;
      if (chunk.cropOrDomain.toLowerCase().includes(token)) score += 3;
      if (chunkText.includes(token)) score += 1.5;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).filter((s) => s.score > 0).map((s) => s.chunk);
}
