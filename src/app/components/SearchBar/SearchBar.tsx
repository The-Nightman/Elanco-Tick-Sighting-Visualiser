"use client";

import useDebounce from "@/app/hooks/useDebounce";
import { CityData } from "@/interfaces/CityData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 150);
  const router = useRouter();

  useEffect(() => {
    const apiQuery = async () => {
      const res = await fetch(
        `/api/cities/search?q=${encodeURIComponent(debouncedSearchTerm.trim())}`,
      );
      const data: CityData[] = await res.json();
      setSearchResults(data);
    };

    apiQuery();
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-col w-fit self-center">
      <div className="relative">
        <input
          className="w-3xl px-4 py-1 text-xl border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          type="text"
          placeholder="Search for a city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
      </div>
      <div className="relative">
        {searchResults.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-3xl p-2 overflow-y-auto border border-neutral-300 bg-white shadow-lg">
            {searchResults.map((result) => (
              <li
                key={result.id}
                className="cursor-pointer rounded p-2 hover:bg-neutral-100"
                role="menuitem"
                onClick={() => router.push(`/city/${result.id}`)}
              >
                {result.cityName}, {result.nation}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
