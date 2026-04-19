"use client";

import { MapSightingData } from "@/interfaces/MapSightingData";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface MapControlsProps {
  setMapData: Dispatch<SetStateAction<MapSightingData[]>>;
}

const MapControls = ({ setMapData }: MapControlsProps) => {
  const [controlsState, setControlsState] = useState({
    visible: false,
    period: "month",
    selectedYear: new Date().getFullYear(),
  });

  useEffect(() => {
    const apiQuery = async (query: string) => {
      const res = await fetch(query);
      const data: MapSightingData[] = await res.json();
      setMapData(data);
    };

    const queryBuilder = () => {
      const currentDate = new Date();
      let queryUrl = "/api/data/map/allSightings"; // TODO: Support for viewing by tick species

      switch (controlsState.period) {
        case "month":
          queryUrl += `?start=${new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()).toISOString()}&end=${currentDate.toISOString()}`;
          break;

        case "3months":
          queryUrl += `?start=${new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate()).toISOString()}&end=${currentDate.toISOString()}`;
          break;

        case "6months":
          queryUrl += `?start=${new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate()).toISOString()}&end=${currentDate.toISOString()}`;
          break;

        case "12months":
          queryUrl += `?start=${new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()).toISOString()}&end=${currentDate.toISOString()}`;
          break;

        case "year":
          queryUrl += `?start=${new Date(controlsState.selectedYear, 0, 1).toISOString()}&end=${new Date(controlsState.selectedYear, 11, 31).toISOString()}`;
          break;

        case "max":
          queryUrl += `?start=${new Date(2000, 0, 1).toISOString()}&end=${currentDate.toISOString()}`;
          break;

        default:
          break;
      }

      return queryUrl;
    };

    apiQuery(queryBuilder());
  }, [controlsState.period, controlsState.selectedYear]);

  return (
    <div className="absolute top-0 right-0 flex h-full">
      <button
        className="bg-neutral-800 w-6 h-12 rounded-l-xl self-center cursor-pointer"
        aria-expanded={controlsState.visible}
        aria-controls="map-controls"
        aria-label={
          controlsState.visible ? "Hide Map Controls" : "Show Map Controls"
        }
        onClick={() =>
          setControlsState({
            ...controlsState,
            visible: !controlsState.visible,
          })
        }
      >
        {controlsState.visible ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M6 17L11 12L6 7M13 17L18 12L13 7"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>{" "}
            </g>
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#000000"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M18 17L13 12L18 7M11 17L6 12L11 7"
                stroke="#ffffff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>{" "}
            </g>
          </svg>
        )}
      </button>
      {controlsState.visible && (
        <form
          id="map-controls"
          className="h-full bg-neutral-800 text-white px-6 py-4"
        >
          <fieldset className="flex flex-col text-lg gap-4">
            <div className="flex gap-[0.1rem]">
              <div className="group">
                <div className="w-11 bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none rounded-l-md">
                  <input
                    type="radio"
                    name="last month"
                    id="periodM"
                    aria-label="Sightings Last Month"
                    className="peer hidden"
                    checked={controlsState.period === "month"}
                    onChange={() =>
                      setControlsState({ ...controlsState, period: "month" })
                    }
                  />
                  <label htmlFor="periodM" className="block cursor-pointer">
                    M
                  </label>
                </div>
              </div>

              <div className="group">
                <div className="w-11 bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none">
                  <input
                    type="radio"
                    name="last 3 months"
                    id="period3M"
                    aria-label="Sightings Last 3 Months"
                    className="peer hidden"
                    checked={controlsState.period === "3months"}
                    onChange={() =>
                      setControlsState({ ...controlsState, period: "3months" })
                    }
                  />
                  <label htmlFor="period3M" className="block cursor-pointer">
                    3M
                  </label>
                </div>
              </div>

              <div className="group">
                <div className="w-11 bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none">
                  <input
                    type="radio"
                    name="last 6 months"
                    id="period6M"
                    aria-label="Sightings Last 6 Months"
                    className="peer hidden"
                    checked={controlsState.period === "6months"}
                    onChange={() =>
                      setControlsState({ ...controlsState, period: "6months" })
                    }
                  />
                  <label htmlFor="period6M" className="block cursor-pointer">
                    6M
                  </label>
                </div>
              </div>

              <div className="group">
                <div className="w-11 bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none">
                  <input
                    type="radio"
                    name="last 12 months"
                    id="period12M"
                    aria-label="Sightings Last 12 Months"
                    className="peer hidden"
                    checked={controlsState.period === "12months"}
                    onChange={() =>
                      setControlsState({ ...controlsState, period: "12months" })
                    }
                  />
                  <label htmlFor="period12M" className="block cursor-pointer">
                    12M
                  </label>
                </div>
              </div>

              <div className="group">
                <div className="w-11 bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none">
                  <input
                    type="radio"
                    name="selected year"
                    id="periodY"
                    aria-label="Sightings During Selected Year"
                    className="peer hidden"
                    checked={controlsState.period === "year"}
                    onChange={() =>
                      setControlsState({ ...controlsState, period: "year" })
                    }
                  />
                  <label htmlFor="periodY" className="block cursor-pointer">
                    Year
                  </label>
                </div>
              </div>
              <div className="group">
                <div className="w-11 bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none rounded-r-md">
                  <input
                    type="radio"
                    name="lifetime"
                    id="periodMax"
                    aria-label="Sightings During Lifetime"
                    className="peer hidden"
                    checked={controlsState.period === "max"}
                    onChange={() =>
                      setControlsState({ ...controlsState, period: "max" })
                    }
                  />
                  <label htmlFor="periodMax" className="block cursor-pointer">
                    Max
                  </label>
                </div>
              </div>
            </div>
            <div className="group flex flex-col">
              <label
                htmlFor="yearSelect"
                className="group-[&:has(select:disabled)]:opacity-50"
              >
                Select Year:
              </label>
              <select
                name="year select"
                id="yearSelect"
                className="peer bg-neutral-600 text-white rounded-md p-1 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={controlsState.period !== "year"}
                aria-description={
                  controlsState.period !== "year"
                    ? "Please select the Year period above to select a year to view"
                    : "Please select a year to view"
                }
                value={controlsState.selectedYear}
                onChange={(e) =>
                  setControlsState({
                    ...controlsState,
                    selectedYear: parseInt(e.target.value, 10),
                  })
                }
              >
                {Array.from(
                  { length: new Date().getFullYear() - 2000 + 1 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
};

export default MapControls;
