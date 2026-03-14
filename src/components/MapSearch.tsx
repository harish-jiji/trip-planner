"use client";

import { useState, useCallback } from "react";
import debounce from "lodash.debounce";

interface Props {
  onSelect: (location: any) => void;
}

export default function MapSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchPlaces = useCallback(
    debounce(async (value: string) => {
      if (value.length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=5`
        );
        const data = await res.json();
        setResults(data.features || []);
      } catch (error) {
        console.error("Error searching places:", error);
        setResults([]);
      }
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchPlaces(value);
  };

  const selectPlace = (place: any) => {
    const lat = place.geometry.coordinates[1];
    const lng = place.geometry.coordinates[0];
    const name = place.properties.name || "Unknown Place";

    onSelect({
      lat,
      lng,
      name,
    });

    setQuery(""); // clear input for next search
    setResults([]);
  };

  return (
    <div className="relative w-full mb-4">
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search for places to add..."
        className="
          w-full p-3 rounded-lg border
          dark:bg-gray-800 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all
        "
      />

      {results.length > 0 && (
        <div className="
          absolute w-full mt-1
          bg-white dark:bg-gray-900
          border dark:border-gray-700 rounded-lg shadow-xl
          max-h-60 overflow-y-auto z-[500]
        ">
          {results.map((place, i) => (
            <div
              key={i}
              onClick={() => selectPlace(place)}
              className="
                p-3 cursor-pointer text-sm
                hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-800 dark:text-gray-200
                border-b dark:border-gray-800 last:border-0
              "
            >
              <div className="font-medium">{place.properties.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {[place.properties.city, place.properties.state, place.properties.country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
