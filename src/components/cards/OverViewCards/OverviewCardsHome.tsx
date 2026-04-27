import { OverviewCardsHomeData } from "@/interfaces/OverviewCardsHomeData";
import { JSX } from "react";

interface OverviewCardsHomeProps {
  data: OverviewCardsHomeData;
}

const OverviewCardsHome = ({ data }: OverviewCardsHomeProps) => {
  const trendIcons: Record<string, JSX.Element> = {
    Increasing: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <g clip-path="url(#clip0_429_10973)">
            {" "}
            <path
              d="M3 17L9 11L13 15L21 7"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
            <path
              d="M17 7H21V11"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
          </g>{" "}
          <defs>
            {" "}
            <clipPath id="clip0_429_10973">
              {" "}
              <rect width="24" height="24" fill="white"></rect>{" "}
            </clipPath>{" "}
          </defs>{" "}
        </g>
      </svg>
    ),
    Decreasing: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <g clip-path="url(#clip0_429_11166)">
            {" "}
            <path
              d="M3 7L9 13L13 9L21 17"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
            <path
              d="M17 17H21V13"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
          </g>{" "}
          <defs>
            {" "}
            <clipPath id="clip0_429_11166">
              {" "}
              <rect width="24" height="24" fill="white"></rect>{" "}
            </clipPath>{" "}
          </defs>{" "}
        </g>
      </svg>
    ),
    Stable: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <g clip-path="url(#clip0_429_11167)">
            {" "}
            <path
              d="M3 12H21"
              stroke="#ffffff"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>{" "}
          </g>{" "}
          <defs>
            {" "}
            <clipPath id="clip0_429_11167">
              {" "}
              <rect width="24" height="24" fill="white"></rect>{" "}
            </clipPath>{" "}
          </defs>{" "}
        </g>
      </svg>
    ),
  };

  return (
    <div className="flex flex-wrap gap-4 text-white">
      <article className="flex flex-col w-full lg:basis-[calc(50%-0.5rem)] min-h-48 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="text-2xl text-white font-semibold mb-3">
          Sightings reported
        </h4>
        <div className="flex justify-between gap-4 px-2 flex-wrap">
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">
              Past month:
            </span>
            <span className="text-4xl font-bold text-sky-600">
              {data.sightingsReports.sightingsPastMonth}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">
              Past quarter:
            </span>
            <span className="text-4xl font-bold text-sky-600">
              {data.sightingsReports.sightingsPastQuarter}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">
              Past year:
            </span>
            <span className="text-4xl font-bold text-sky-600">
              {data.sightingsReports.sightingsPastYear}
            </span>
          </p>
        </div>
      </article>
      <article className="flex flex-col w-full lg:basis-[calc(50%-0.5rem)] min-h-48 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="text-2xl text-white font-semibold">Reports this week</h4>
        <p className="flex flex-col-reverse text-4xl font-bold text-sky-600">
          <span>{data.sightingsReports.reportsThisWeek}</span>
          <span className="text-lg font-medium text-gray-300">
            Sightings reported
          </span>
        </p>
      </article>
      <article className="flex flex-col w-full lg:basis-[calc(50%-0.5rem)] min-h-48 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="text-2xl text-white font-semibold">National trend</h4>
        <div className="flex justify-between gap-4 px-2 flex-wrap">
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">Monthly:</span>
            <span
              className={`text-xl font-bold ${data.trendData.pastMonth.trend === "Increasing" ? "text-red-500" : data.trendData.pastMonth.trend === "Decreasing" ? "text-green-500" : "text-sky-600"}`}
            >
              <span>
                {data.trendData.pastMonth.trend}{" "}
                <span className="text-sm text-gray-400">
                  {data.trendData.pastMonth.percentageChange !== null
                    ? `(${data.trendData.pastMonth.percentageChange.toPrecision(3)}%)`
                    : "(New Data)"}
                </span>
              </span>
              {trendIcons[data.trendData.pastMonth.trend]}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">
              6 Monthly:
            </span>
            <span
              className={`text-xl font-bold ${data.trendData.pastSixMonths.trend === "Increasing" ? "text-red-500" : data.trendData.pastSixMonths.trend === "Decreasing" ? "text-green-500" : "text-sky-600"}`}
            >
              <span>
                {data.trendData.pastSixMonths.trend}{" "}
                <span className="text-sm text-gray-400">
                  {data.trendData.pastSixMonths.percentageChange !== null
                    ? `(${data.trendData.pastSixMonths.percentageChange.toPrecision(3)}%)`
                    : "(New Data)"}
                </span>
              </span>
              {trendIcons[data.trendData.pastSixMonths.trend]}
            </span>
          </p>
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">Yearly:</span>
            <span
              className={`text-xl font-bold ${data.trendData.pastYear.trend === "Increasing" ? "text-red-500" : data.trendData.pastYear.trend === "Decreasing" ? "text-green-500" : "text-sky-600"}`}
            >
              <span>
                {data.trendData.pastYear.trend}{" "}
                <span className="text-sm text-gray-400">
                  {data.trendData.pastYear.percentageChange !== null
                    ? `(${data.trendData.pastYear.percentageChange.toPrecision(3)}%)`
                    : "(New Data)"}
                </span>
              </span>
              {trendIcons[data.trendData.pastYear.trend]}
            </span>
          </p>
        </div>
      </article>
      <article className="flex flex-col w-full lg:basis-[calc(50%-0.5rem)] min-h-48 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="text-2xl text-white font-semibold">Peak season</h4>
        <p className="text-4xl font-bold text-sky-600">
          <span aria-hidden>
            {data.peakSeason.quarter ? (
              <>
                <span className="mr-4">Q{data.peakSeason.quarter}</span>
                <span className="text-2xl text-gray-400">
                  {data.peakSeason.totalSightings > 1
                    ? `${data.peakSeason.totalSightings} sightings`
                    : `${data.peakSeason.totalSightings} sighting`}
                </span>
              </>
            ) : (
              "N/A"
            )}
          </span>
          <span className="sr-only">
            {data.peakSeason.quarter
              ? `Quarter ${data.peakSeason.quarter} ${data.peakSeason.totalSightings} sightings`
              : "N/A"}
          </span>
        </p>
      </article>
      <article className="flex flex-col w-full lg:basis-[calc(50%-0.5rem)] min-h-56 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="flex flex-col text-2xl text-white font-semibold">
          <span>Fastest rising areas</span>
          <span className="text-lg font-medium text-gray-300">
            Top 3 in order of highest to lowest
          </span>
        </h4>
        {data.topRisingLocations.map((loc) => (
          <p key={loc.location} className="text-xl font-medium text-white">
            {loc.location}{" "}
            <span className="text-gray-400">
              {loc.rateOfChange !== null
                ? `(${loc.rateOfChange.toPrecision(3)}%)`
                : "(New Data)"}
            </span>
          </p>
        ))}
        {data.topRisingLocations.length === 0 && (
          <p className="text-xl font-bold text-white">
            No significant increases
          </p>
        )}
      </article>
      <article className="flex flex-col w-full lg:basis-[calc(50%-0.5rem)] min-h-48 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="text-2xl text-white font-semibold">
          Species most affected
        </h4>
        <div className="flex justify-between gap-4 px-2 flex-wrap">
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">
              This year:
            </span>
            <span className="text-xl font-bold">
              {data.mostAffectedSpecies.yearMostAffectedSpecies?.speciesName ||
                "N/A"}
            </span>
            <span className="text-xl font-bold text-sky-500">
              {data.mostAffectedSpecies.yearMostAffectedSpecies
                ?.sightingCount || 0}{" "}
              sightings
            </span>
          </p>
          <p className="flex flex-col">
            <span className="text-lg font-medium text-gray-300">All time:</span>
            <span className="text-xl font-bold">
              {data.mostAffectedSpecies.maxMostAffectedSpecies?.speciesName ||
                "N/A"}
            </span>
            <span className="text-xl font-bold text-sky-500">
              {data.mostAffectedSpecies.maxMostAffectedSpecies?.sightingCount ||
                0}{" "}
              sightings
            </span>
          </p>
        </div>
      </article>
      <article className="flex flex-col w-full min-h-48 bg-neutral-800 p-4 rounded justify-between">
        <h4 className="text-2xl text-white font-semibold">
          Invasive species reported
        </h4>
        <p className="text-xl font-bold text-white">
          {/* NOT YET IMPLEMENTED */}
          No invasive species reported
        </p>
      </article>
    </div>
  );
};

export default OverviewCardsHome;
