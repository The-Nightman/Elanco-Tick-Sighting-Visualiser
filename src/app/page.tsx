"use server";

import { db } from "@/db";
import { cities, sightings, species } from "@/db/schema";
import { asc, between, eq, sql, max } from "drizzle-orm";
import TickCountCard from "@/components/Cards/TickCountCard/TickCountCard";
import Histogram from "@/components/Charts/Histogram/Histogram";
import HorizonChart from "@/components/Charts/HorizonChart/HorizonChart";
import { HorizonData } from "@/interfaces/HorizonData";
import { HistogramData } from "@/interfaces/HistogramData";
import { TickCardData } from "@/interfaces/TickCardData";
import TabGroup from "@/components/Tabs/TabGroup/TabGroup";
import Tab from "@/components/Tabs/Tab/Tab";
import SearchBar from "@/components/SearchBar/SearchBar";
import D3Map from "@/components/Map/D3Map";
import OverviewCardsHome from "@/components/Cards/OverViewCards/OverviewCardsHome";
import Link from "next/link";
import DownloadButton from "@/components/Button/DownloadButton";
import { StackedHistogramData } from "@/interfaces/StackedHistogramData";
import HistogramStacked from "@/components/Charts/HistogramStacked/HistorgramStacked";

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

  const stackedHistogramData: StackedHistogramData[] = await db
    .select({
      date: histogramMonthBucket,
      speciesName: species.speciesName,
      count: sql<number>`COUNT(*)`,
    })
    .from(sightings)
    .innerJoin(species, eq(sightings.speciesId, species.id))
    .where(between(sightings.sightingDate, startOfYear, endOfYear))
    .groupBy(histogramMonthBucket, species.speciesName)
    .orderBy(asc(histogramMonthBucket), asc(species.speciesName))
    .then((data) => {
      const groupedData: Record<
        string,
        { date: string; data: { speciesName: string; count: number }[] }
      > = {};

      data.forEach(({ date, speciesName, count }) => {
        if (!groupedData[date]) {
          groupedData[date] = { date, data: [] };
        }
        groupedData[date].data.push({ speciesName, count });
      });

      return Object.values(groupedData);
    });

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

  const [overviewData] = await db
    .select({
      sightingsPastMonth: db.$count(
        sightings,
        between(
          sightings.sightingDate,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      ),
      sightingsPastQuarter: db.$count(
        sightings,
        between(
          sightings.sightingDate,
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      ),
      sightingsPastYear: db.$count(
        sightings,
        between(
          sightings.sightingDate,
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      ),
      reportsThisWeek: db.$count(
        sightings,
        between(
          sightings.sightingDate,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          new Date(),
        ),
      ),
    })
    .from(sightings);

  const [trendData] = await db
    .select({
      monthTrend: sql<string>`CASE
      WHEN AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 1 MONTH THEN 1 ELSE NULL END) >
           AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 3 MONTH AND ${sightings.sightingDate} < NOW() - INTERVAL 1 MONTH THEN 1 ELSE NULL END)
      THEN 'Increasing'
      WHEN AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 1 MONTH THEN 1 ELSE NULL END) <
           AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 3 MONTH AND ${sightings.sightingDate} < NOW() - INTERVAL 1 MONTH THEN 1 ELSE NULL END)
      THEN 'Decreasing'
      ELSE 'Stable'
    END`,
      sixMonthTrend: sql<string>`CASE
      WHEN AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 6 MONTH THEN 1 ELSE NULL END) >
           AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 12 MONTH AND ${sightings.sightingDate} < NOW() - INTERVAL 6 MONTH THEN 1 ELSE NULL END)
      THEN 'Increasing'
      WHEN AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 6 MONTH THEN 1 ELSE NULL END) <
           AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 12 MONTH AND ${sightings.sightingDate} < NOW() - INTERVAL 6 MONTH THEN 1 ELSE NULL END)
      THEN 'Decreasing'
      ELSE 'Stable'
    END`,
      yearTrend: sql<string>`CASE
      WHEN AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 1 YEAR THEN 1 ELSE NULL END) >
           AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 2 YEAR AND ${sightings.sightingDate} < NOW() - INTERVAL 1 YEAR THEN 1 ELSE NULL END)
      THEN 'Increasing'
      WHEN AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 1 YEAR THEN 1 ELSE NULL END) <
           AVG(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 2 YEAR AND ${sightings.sightingDate} < NOW() - INTERVAL 1 YEAR THEN 1 ELSE NULL END)
      THEN 'Decreasing'
      ELSE 'Stable'
    END`,
    })
    .from(sightings);

  const [peakSeason] = await db
    .select({
      quarter: sql<number>`QUARTER(${sightings.sightingDate})`,
      totalSightings: sql<number>`SUM(1)`,
    })
    .from(sightings)
    .where(sql`YEAR(${sightings.sightingDate}) = ${currentYear}`)
    .groupBy(sql`QUARTER(${sightings.sightingDate})`)
    .orderBy(sql`SUM(1) DESC`)
    .limit(1);

  const topRisingLocations = await db
    .select({
      location: cities.cityName,
      recentCount: sql<number>`SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END)`,
      previousCount: sql<number>`SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END)`,
      rateOfChange: sql<number>`CASE
      WHEN SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) = 0 THEN NULL
      ELSE (
        (
          SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) -
          SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END)
        ) /
        SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END)
      ) * 100
    END`,
    })
    .from(sightings)
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .groupBy(cities.cityName)
    .orderBy(
      sql`CASE
      WHEN SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) = 0 THEN NULL
      ELSE (
        (
          SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) -
          SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END)
        ) /
        SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END)
      ) * 100
    END DESC`,
    )
    .limit(3);

  const [yearMostAffectedSpecies] = await db
    .select({
      speciesName: species.speciesName,
      sightingCount: sql<number>`COUNT(*)`,
    })
    .from(sightings)
    .where(between(sightings.sightingDate, startOfYear, endOfYear))
    .innerJoin(species, eq(sightings.speciesId, species.id))
    .groupBy(species.speciesName)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(1);

  const [maxMostAffectedSpecies] = await db
    .select({
      speciesName: species.speciesName,
      sightingCount: sql<number>`COUNT(*)`,
    })
    .from(sightings)
    .innerJoin(species, eq(sightings.speciesId, species.id))
    .groupBy(species.speciesName)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(1);

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
        <section className="flex flex-col">
          <div className="flex max-w-full gap-4 overflow-x-scroll no-scrollbar">
            {tickCardDataQuery.map((item, index) => (
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
          <OverviewCardsHome
            data={{
              ...overviewData,
              trendData,
              peakSeason,
              topRisingLocations: topRisingLocations.filter(
                (loc) => loc.rateOfChange !== null,
              ),
              yearMostAffectedSpecies,
              maxMostAffectedSpecies,
            }}
          />
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
          <Tab label="Sightings by species">
            <div className="w-full h-120 pt-4 pb-6 px-6 flex flex-col gap-3">
              <h3 className="text-2xl text-white font-semibold">
                Sightings by species through {currentYear}
              </h3>
              <div className="flex-1">
                <HistogramStacked
                  // generate date strings for each month of the year to gap-fill database results so that all months are represented
                  data={Array.from({ length: 12 }, (_, m) => {
                    const date = new Date(currentYear, m, 1);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`; //* formatters are unsuitable so this needs to be done manually
                  }).map((date) => {
                    const matchingData = stackedHistogramData.find(
                      (d) => d.date === date,
                    );
                    return {
                      date,
                      data: matchingData ? matchingData.data : [],
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
