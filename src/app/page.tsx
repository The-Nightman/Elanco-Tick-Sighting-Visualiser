"use server";

import { db } from "@/db";
import { cities, sightings, species } from "@/db/schema";
import { asc, between, eq, sql, max } from "drizzle-orm";
import TickCountCard from "./components/cards/TickCountCard";
import Histogram from "./components/charts/histogram/Histogram";
import HorizonChart from "./components/charts/HorizonChart";
import { HorizonData } from "@/interfaces/HorizonData";
import { HistogramData } from "@/interfaces/HistogramData";
import { TickCardData } from "@/interfaces/TickCardData";
import TabGroup from "./components/Tabs/TabGroup/TabGroup";
import Tab from "./components/Tabs/Tab/Tab";
import SearchBar from "./components/SearchBar/SearchBar";

const page = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const tickCardDataQuery: TickCardData[] = (await db
    .select({
      sightings: db.$count(sightings, eq(sightings.speciesId, species.id)),
      species: species.speciesName,
      latinName: species.latinName,
      lastReported: max(sightings.sightingDate),
    })
    .from(sightings)
    .innerJoin(species, eq(sightings.speciesId, species.id))
    .groupBy(species.id)) as TickCardData[]; // Type assertion to fix Date | null error when we know date will always be present

  const histogramMonthBucket = sql<string>`DATE_FORMAT(${sightings.sightingDate}, '%Y-%m-01')`;

  const histogramData: HistogramData[] = await db
    .select({
      date: histogramMonthBucket,
      count: sql<number>`COUNT(*)`,
    })
    .from(sightings)
    .where(between(sightings.sightingDate, startOfYear, endOfYear))
    .groupBy(histogramMonthBucket)
    .orderBy(asc(histogramMonthBucket));

  const horizonDataQuery: HorizonData[] = await db
    .select({
      cityId: cities.id,
      cityName: cities.cityName,
      date: sightings.sightingDate,
      sightingCount: sql<number>`COUNT(*)`,
    })
    .from(sightings)
    .where(between(sightings.sightingDate, startOfYear, endOfYear))
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .groupBy(cities.id, cities.cityName, sightings.sightingDate)
    .orderBy(asc(cities.cityName), asc(sightings.sightingDate));

  const cityData = await db.select().from(cities);

  return (
    <>
      <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4 gap-8">
        <SearchBar />
        <h2 className="text-4xl font-bold">
          <div>
            <span aria-hidden="true">UK </span>
            <span className="sr-only">United Kingdom</span>
            sightings
          </div>
        </h2>
        <section className="flex max-w-full gap-4 overflow-x-scroll no-scrollbar">
          {tickCardDataQuery.map((item, index) => (
            <TickCountCard
              key={`tickCard-${item.species}-${index}-TickCountCard`}
              data={item}
            />
          ))}
        </section>
        <TabGroup>
          <Tab label="Sightings over time">
            <div className="w-full h-120 pt-4 pb-6 px-6 flex flex-col gap-3">
              <h3 className="text-2xl text-white font-semibold">
                Sightings through {currentYear}
              </h3>
              <div className="flex-1">
                <Histogram
                  // generate date strings for each month of the year to gap-fill database results so that all months are represented
                  data={Array.from({ length: 12 }, (_, m) => {
                    const date = new Date(currentYear, m, 1);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`; //* formatters are unsuitable so this needs to be done manually
                  }).map((date) => {
                    const matchingData = histogramData.find(
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
                Sightings through {currentYear} by City
              </h3>
              <HorizonChart
                // Include all cities in the data even with no sightings in the given timeframe
                data={cityData
                  .flatMap((city) => {
                    const citySightings = horizonDataQuery.filter(
                      (data) => data.cityId === city.id,
                    );
                    // Find sightings for this city, if none exist, return a default entry with 0 so it is included in the chart
                    if (citySightings.length === 0) {
                      return [
                        {
                          cityId: city.id,
                          cityName: city.cityName,
                          date: startOfYear,
                          sightingCount: 0,
                        },
                      ];
                    }
                    return citySightings;
                  })
                  .sort((a, b) => a.cityName.localeCompare(b.cityName))}
              />
            </div>
          </Tab>
        </TabGroup>
      </div>
    </>
  );
};

export default page;
