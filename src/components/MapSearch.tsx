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
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-[1000]">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-xl p-2 border border-gray-100 dark:border-gray-800 flex items-center">
        <div className="text-gray-400 ml-2">
            <Search size={20} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places..."
          className="w-full bg-transparent p-3 outline-none text-gray-900 dark:text-white"
        />
      </div>



      {results.length > 0 && query.length >= 2 && (
        <div className="bg-white dark:bg-slate-900 mt-2 rounded-xl max-h-60 overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-800">
          {results.map((place, index) => (
            <div
              key={index}
              onClick={() => selectPlace(place)}
              className="p-4 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-blue-500">📍</div>
              <div>
                <div className="font-bold text-[14px] text-gray-900 dark:text-white line-clamp-1">
                    {place.name || place.display_name?.split(',')[0]}
                </div>
                <div className="text-[12px] font-medium text-gray-500 max-w-[90%] truncate">
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
