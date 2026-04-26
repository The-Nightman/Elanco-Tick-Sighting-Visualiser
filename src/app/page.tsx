"use client";

import TickCountCard from "@/components/Cards/TickCountCard/TickCountCard";
import Histogram from "@/components/Charts/Histogram/Histogram";
import HorizonChart from "@/components/Charts/HorizonChart/HorizonChart";
import TabGroup from "@/components/Tabs/TabGroup/TabGroup";
import Tab from "@/components/Tabs/Tab/Tab";
import SearchBar from "@/components/SearchBar/SearchBar";
import D3Map from "@/components/Map/D3Map";
import OverviewCardsHome from "@/components/Cards/OverViewCards/OverviewCardsHome";
import Link from "next/link";
import DownloadButton from "@/components/Button/DownloadButton";
import TimeControls from "@/components/Button/TimeControls/TimeControls";
import { useEffect, useState } from "react";
import { HomepageData } from "@/interfaces/HomepageData";

const dataPlaceHolder = {
  tickCardData: [],
  histogramData: [],
  horizonData: [],
  overviewCardsData: {
    sightingsReports: {
      sightingsPastMonth: 0,
      sightingsPastQuarter: 0,
      sightingsPastYear: 0,
      reportsThisWeek: 0,
    },
    trendData: {
      pastMonth: {
        percentageChange: 0,
        trend: "Stable",
      },
      pastSixMonths: {
        percentageChange: 0,
        trend: "Stable",
      },
      pastYear: {
        percentageChange: 0,
        trend: "Stable",
      },
    },
    peakSeason: {
      quarter: 0,
      totalSightings: 0,
    },
    topRisingLocations: [],
    mostAffectedSpecies: {
      yearMostAffectedSpecies: {
        speciesName: null,
        sightingCount: 0,
      },
      maxMostAffectedSpecies: {
        speciesName: null,
        sightingCount: 0,
      },
    },
  },
};

const page = () => {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<HomepageData>(dataPlaceHolder);
  const [controlsState, setControlsState] = useState({
    period: "currentYear",
    selectedYear: currentYear,
  });

  useEffect(() => {
    const apiQuery = async (query: string) => {
      const res = await fetch(query);
      const data: HomepageData = await res.json();
      setData(data);
    };

    const queryBuilder = () => {
      let queryUrl = "/api/data/pages/home";

      switch (controlsState.period) {
        case "currentYear":
          queryUrl += `?viewYear=${currentYear}`;
          break;
        case "selectedYear":
          queryUrl += `?viewYear=${controlsState.selectedYear}`;
          break;
        case "max":
          queryUrl += `?viewYear=max`;
          break;
        default:
          break;
      }

      return queryUrl;
    };

    apiQuery(queryBuilder());
  }, [controlsState.period, controlsState.selectedYear]);

  return (
    <>
      <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4 gap-8 overflow-x-hidden">
        <SearchBar />
        <h2 className="text-4xl font-bold">
          <div>
            <span aria-hidden="true">UK </span>
            <span className="sr-only">United Kingdom</span>
            sightings
          </div>
        </h2>
        <DownloadButton
          apiUrl="/api/data/reports"
          reportName="Ticks_Sightings_National"
        />
        <section className="flex flex-col max-w-full gap-4 overflow-x-scroll no-scrollbar justify-center bg-neutral-800 p-4">
          <h3 className="text-2xl text-white font-semibold">UK sighting map</h3>
          <D3Map />
        </section>
        <div className="flex justify-end">
          <TimeControls
            ariaDataName="UK"
            radioGroupName="tickCards"
            state={controlsState}
            setState={setControlsState}
          />
        </div>
        <section className="flex flex-col">
          <div className="flex max-w-full gap-4 overflow-x-scroll no-scrollbar">
            {data.tickCardData.map((item, index) => (
              <TickCountCard
                key={`tickCard-${item.species}-${index}-TickCountCard`}
                data={item}
              />
            ))}
          </div>
          <Link
            href="/tick-information"
            className="text-lg text-blue-500 hover:underline font-medium "
          >
            Learn more about ticks species →
          </Link>
        </section>
        <section>
          <div className="flex bg-neutral-800 items-center gap-2 p-2 mb-2 border-b-sky-600 border-b-4">
            <h3 className="text-2xl text-white font-semibold">Overview</h3>
          </div>
          <OverviewCardsHome data={data.overviewCardsData} />
        </section>
        <TabGroup>
          <Tab label="Sightings over time">
            <div className="w-full h-120 pt-4 pb-6 px-6 flex flex-col gap-3">
              <h3 className="text-2xl text-white font-semibold">
                Sightings through {controlsState.selectedYear}
              </h3>
              <div className="flex-1">
                <Histogram
                  // generate date strings for each month of the year to gap-fill database results so that all months are represented
                  data={Array.from({ length: 12 }, (_, m) => {
                    const date = new Date(controlsState.selectedYear, m, 1);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`; //* formatters are unsuitable so this needs to be done manually
                  }).map((date) => {
                    const matchingData = data.histogramData.find(
                      (d) => d.date === date,
                    );
                    return {
                      date,
                      count: matchingData ? matchingData.count : 0,
                    };
                  })}
                />
              </div>
            </div>
          </Tab>
          <Tab label="Sightings by city">
            <div className="w-full h-fit pt-4 pb-6 px-6 flex flex-col gap-3">
              <h3 className="text-2xl text-white font-semibold">
                Sightings through {controlsState.selectedYear} by City
              </h3>
              <HorizonChart
                // Include all cities in the data even with no sightings in the given timeframe
                data={data.horizonData}
              />
            </div>
          </Tab>
        </TabGroup>
      </div>
    </>
  );
};

export default page;
