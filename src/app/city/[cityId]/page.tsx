"use client";

import DownloadButton from "@/components/Button/DownloadButton/DownloadButton";
import TimeControls from "@/components/Button/TimeControls/TimeControls";
import OverviewCardsCity from "@/components/Cards/OverViewCards/OverviewCardsCity";
import TickCountCard from "@/components/Cards/TickCountCard/TickCountCard";
import Histogram from "@/components/Charts/Histogram/Histogram";
import HistogramStacked from "@/components/Charts/HistogramStacked/HistogramStacked";
import Tab from "@/components/Tabs/Tab/Tab";
import TabGroup from "@/components/Tabs/TabGroup/TabGroup";
import { CitypageData } from "@/interfaces/CitypageData";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const dataPlaceHolder = {
  tickCardData: [],
  histogramData: [],
  stackedHistogramData: [],
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

const CityPage = () => {
  const { cityId } = useParams();

  const currentYear = new Date().getFullYear();
  const [cityData, setCityData] = useState({
    cityName: "",
    nation: "",
  });
  const [data, setData] = useState<CitypageData>(dataPlaceHolder);
  const [controlsState, setControlsState] = useState({
    period: "currentYear",
    selectedYear: currentYear,
  });

  useEffect(() => {
    const cityDataQuery = async () => {
      const res = await fetch(`/api/cities/${cityId}`);
      const cityData = await res.json();
      if (!cityData) {
        notFound();
      }

      setCityData({ cityName: cityData.cityName, nation: cityData.nation });
    };

    cityDataQuery();
  }, []);

  useEffect(() => {
    const apiQuery = async (query: string) => {
      const res = await fetch(query);
      const data: CitypageData = await res.json();
      setData(data);
    };

    const queryBuilder = () => {
      let queryUrl = `/api/data/pages/city/${cityId}`;

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
  }, [cityId, controlsState.period, controlsState.selectedYear]);

  return (
    <>
      <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4 gap-8">
        <h2 className="text-4xl font-bold">
          <div>{cityData.cityName} sightings</div>
        </h2>
        <DownloadButton
          apiUrl={`/api/data/reports?city=${cityId}`}
          reportName={`Ticks_Sightings_${cityData.cityName.replace(/\s/g, "_")}.csv`}
        />
        <div className="flex justify-end">
          <TimeControls
            ariaDataName="UK"
            radioGroupName="tickCards"
            state={controlsState}
            setState={setControlsState}
          />
        </div>
        <section className="flex max-w-full gap-4 overflow-x-scroll no-scrollbar">
          {data.tickCardData.map((item, index) => (
            <TickCountCard
              key={`tickCard-${item.species}-${index}-TickCountCard`}
              data={item}
            />
          ))}
        </section>
        <section>
          <div className="flex bg-neutral-800 items-center gap-2 p-2 mb-2 border-b-sky-600 border-b-4">
            <h3 className="text-2xl text-white font-semibold">Overview</h3>
          </div>
          <OverviewCardsCity data={data.overviewCardsData} />
        </section>
        <TabGroup>
          <Tab label="Sightings over time">
            <div className="w-full h-120 pt-4 pb-6 px-6 flex flex-col gap-3">
              <h3 className="text-2xl text-white font-semibold">
                <span className="block">
                  Sightings through {controlsState.selectedYear}
                </span>
                <span className="block text-base text-neutral-300">
                  (Hover for more details)
                </span>
              </h3>
              <div className="flex-1">
                <Histogram
                  // generate date strings for each month of the year to gap-fill database results so that all months are represented
                  data={
                    controlsState.period === "max"
                      ? data.histogramData
                      : Array.from({ length: 12 }, (_, m) => {
                          const date = new Date(
                            controlsState.selectedYear,
                            m,
                            1,
                          );
                          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`; //* formatters are unsuitable so this needs to be done manually
                        }).map((date) => {
                          const matchingData = data.histogramData.find(
                            (d) => d.date === date,
                          );
                          return {
                            date,
                            count: matchingData ? matchingData.count : 0,
                          };
                        })
                  }
                />
              </div>
            </div>
          </Tab>
          <Tab label="Sightings by species">
            <div className="w-full h-120 pt-4 pb-6 px-6 flex flex-col gap-3">
              <h3 className="text-2xl text-white font-semibold">
                Sightings by species through {controlsState.selectedYear}
              </h3>
              <div className="flex-1">
                <HistogramStacked
                  // generate date strings for each month of the year to gap-fill database results so that all months are represented
                  data={
                    controlsState.period === "max"
                      ? data.stackedHistogramData
                      : Array.from({ length: 12 }, (_, m) => {
                          const date = new Date(
                            controlsState.selectedYear,
                            m,
                            1,
                          );
                          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`; //* formatters are unsuitable so this needs to be done manually
                        }).map((date) => {
                          const matchingData = data.stackedHistogramData.find(
                            (d) => d.date === date,
                          );
                          return {
                            date,
                            data: matchingData ? matchingData.data : [],
                          };
                        })
                  }
                />
              </div>
            </div>
          </Tab>
        </TabGroup>
      </div>
    </>
  );
};

export default CityPage;
