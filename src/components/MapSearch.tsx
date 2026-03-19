"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Props {
  onSelect: (location: any) => void;
}

export default function MapSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Accept-Language": "en",
          }
        }
      );
      return await res.json();
    } catch (error) {
      console.error("Error searching places:", error);
      return [];
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      const data = await searchPlaces(query);
      setResults(data || []);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const selectPlace = (place: any) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const name = place.display_name || "Unknown Place";

    onSelect({
      lat,
      lng,
      name,
      place
    });

    setQuery(""); // clear input for next search
    setResults([]);
  };

  return (
    <div className="w-full z-[1000] p-3 bg-slate-900 border-b border-slate-800">
      <div className="bg-slate-800 text-white shadow-lg rounded-full px-4 py-1 flex items-center border border-white/5 outline-none">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places..."
          className="w-full bg-transparent px-2 py-3 outline-none text-white text-base placeholder:text-gray-400"
        />
      </div>

      {results.length > 0 && query.length >= 2 && (
        <div className="absolute top-[72px] left-3 right-3 bg-slate-900 rounded-xl max-h-60 overflow-y-auto shadow-2xl border border-white/5 z-[1001]">
          {results.map((place, index) => (
            <div
              key={index}
              onClick={() => selectPlace(place)}
              className="p-3 hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400">📍</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] text-white line-clamp-1">
                    {place.name || place.display_name?.split(',')[0]}
                </div>
                <div className="text-[11px] font-medium text-gray-500 truncate">
                    {place.display_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
