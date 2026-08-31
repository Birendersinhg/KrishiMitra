import React, { useState, useEffect } from "react";
import { ShoppingBag, Search } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import api from "../services/api";

const CATEGORIES = ["ALL", "FERTILIZER", "PESTICIDE", "ORGANIC", "SEEDS", "TOOLS"];

const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    name: "Pure Cold Pressed Organic Neem Oil (10,000 PPM) - 1 Litre",
    brand: "Katyayani Organics",
    category: "PESTICIDE",
    description: "Natural organic pest repellent for sucking insects, caterpillars, paddy, cotton, and vegetables.",
    price: 499,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80",
    amazonUrl: "https://www.amazon.in/s?k=organic+neem+oil+pest+control+plants",
    flipkartUrl: "https://www.flipkart.com/search?q=organic+neem+oil+pesticide",
    suitableFor: "Rice Blast, Whitefly, Aphids, Tomato Early Blight",
  },
  {
    id: "p2",
    name: "Trichoderma Viride Bio-Fungicide (1% WP) - 1 Kg",
    brand: "Multiplex Bio-Tech",
    category: "PESTICIDE",
    description: "Beneficial biocontrol fungus that protects root zone from blast and root rot.",
    price: 280,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=600&auto=format&fit=crop&q=80",
    amazonUrl: "https://www.amazon.in/s?k=trichoderma+viride+bio+fungicide",
    flipkartUrl: "https://www.flipkart.com/search?q=trichoderma+viride+fungicide",
    suitableFor: "Rice Blast, Root Rot, Damping Off, Fungal Infection",
  },
  {
    id: "p3",
    name: "100% Water Soluble NPK 19-19-19 Balanced Fertilizer - 1 Kg",
    brand: "IFFCO / Utkarsh",
    category: "FERTILIZER",
    description: "Balanced essential macronutrients for rapid vegetative growth and healthy green tillers.",
    price: 240,
    rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80",
    amazonUrl: "https://www.amazon.in/s?k=npk+19+19+19+water+soluble+fertilizer",
    flipkartUrl: "https://www.flipkart.com/search?q=npk+19+19+19+fertilizer",
    suitableFor: "Nitrogen Deficiency, Low Potassium, Rice, Tomato",
  },
  {
    id: "p4",
    name: "Double Sided Yellow Sticky Traps for Sucking Pests (Pack of 25)",
    brand: "AgraPlast",
    category: "TOOLS",
    description: "Glue-coated weatherproof yellow sheets that catch whiteflies and thrips.",
    price: 349,
    rating: 4.3,
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22a57?w=600&auto=format&fit=crop&q=80",
    amazonUrl: "https://www.amazon.in/s?k=yellow+sticky+traps+agriculture",
    flipkartUrl: "https://www.flipkart.com/search?q=yellow+sticky+traps+pest",
    suitableFor: "Whitefly, Cotton Leaf Curl, Thrips, Aphids",
  },
  {
    id: "p5",
    name: "Pure 100% Organic Vermicompost Fertilizer - 5 Kg",
    brand: "TrustBasket Organics",
    category: "ORGANIC",
    description: "Enriched with microorganisms and humic acid to loosen soil and boost fertility.",
    price: 380,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format&fit=crop&q=80",
    amazonUrl: "https://www.amazon.in/s?k=vermicompost+fertilizer+organic",
    flipkartUrl: "https://www.flipkart.com/search?q=vermicompost+organic+fertilizer",
    suitableFor: "Soil Deficiency, Soil Condition, Loamy, Red Soil",
  },
  {
    id: "p6",
    name: "Drip Irrigation Kit for Vegetables - Home Garden (20m)",
    brand: "Jain Irrigation",
    category: "TOOLS",
    description: "Complete drip irrigation system with connector, drippers, and pipe for 20m coverage.",
    price: 1299,
    rating: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&auto=format&fit=crop&q=80",
    amazonUrl: "https://www.amazon.in/s?k=drip+irrigation+kit+vegetable+garden",
    flipkartUrl: "https://www.flipkart.com/search?q=drip+irrigation+kit+garden",
    suitableFor: "Vegetable Farming, Water Conservation, Drip Irrigation",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = category !== "ALL" ? `?category=${category}` : "";
    api.get(`/products${params}`)
      .then((res) => {
        if (res.data.success && res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      })
      .catch(() => setProducts(FALLBACK_PRODUCTS))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    (p.suitableFor && p.suitableFor.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Marketplace & Direct Links</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">
            Agricultural Inventory & Fertilizers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-2">
            Clicking "Buy on Amazon" or "Buy on Flipkart" directly opens official store pages with current prices and delivery to your village.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-8 shadow-sm space-y-4">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-3 left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fertilizers, bio-fungicides, neem oil, seeds, drip irrigation..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  category === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
            No products found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
