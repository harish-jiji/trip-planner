"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

interface Props {
  onSelect: (location: any) => void;
}

export default function MapSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery) return [];
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "trip-planner-app"
          }
        }
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error searching places:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const data = await searchPlaces(query);
      setResults(data || []);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const selectPlace = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    
    // Create a cleaner name: take the first few parts of the display name
    const shortName = place.display_name.split(",").slice(0, 3).join(",");

    onSelect({
      lat,
      lng,
      name: shortName,
      place
    });

    setQuery(""); // clear input for next search
    setResults([]);
  };

  return (
    <div className="w-full z-[1000] p-3 bg-slate-900 border-b border-slate-800">
      <div className="relative group">
        <div className="bg-slate-800 text-white shadow-lg rounded-full px-5 py-1 flex items-center border border-white/5 focus-within:border-blue-500/50 transition-all outline-none">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places"
            className="w-full bg-transparent py-3 outline-none text-white text-base placeholder:text-gray-500"
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin ml-2" />}
        </div>

        {results.length > 0 && (
          <div className="absolute top-[68px] left-0 right-0 bg-slate-900/95 backdrop-blur-md rounded-2xl max-h-72 overflow-y-auto shadow-2xl border border-white/10 z-[1001] divide-y divide-white/5">
            {results.map((place, index) => (
              <div
                key={index}
                onClick={() => selectPlace(place)}
                className="p-4 hover:bg-blue-600/10 cursor-pointer transition-colors flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <MapPin size={18} />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                    {place.display_name.split(',')[0]}
                  </div>
                  <div className="text-[11px] font-medium text-gray-500 line-clamp-2 mt-0.5">
                    {place.display_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

