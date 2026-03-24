"use server";

import TickCountCard from "@/app/components/cards/TickCountCard";
import Histogram from "@/app/components/charts/histogram/Histogram";
import Tab from "@/app/components/Tabs/Tab/Tab";
import TabGroup from "@/app/components/Tabs/TabGroup/TabGroup";
import { db } from "@/db";
import { cities, sightings, species } from "@/db/schema";
import { HistogramData } from "@/interfaces/HistogramData";
import { TickCardData } from "@/interfaces/TickCardData";
import { asc, between, eq, max, sql } from "drizzle-orm";
import { notFound } from "next/navigation";

interface CityPageProps {
  params: Promise<{
    cityId: string;
  }>;
}

const CityPage = async ({ params }: CityPageProps) => {
  const { cityId } = await params;

  const [cityData] = await db
    .select()
    .from(cities)
    .where(eq(cities.id, Number(cityId)))
    .limit(1);

  if (!cityData) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const tickCardDataQuery: TickCardData[] = (await db
    .select({
      sightings: sql<number>`COUNT(*)`,
      species: species.speciesName,
      latinName: species.latinName,
      lastReported: max(sightings.sightingDate),
    })
    .from(sightings)
    .where(eq(sightings.cityId, Number(cityId)))
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

  return (
    <>
      <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4 gap-8">
        <h2 className="text-4xl font-bold">
          <div>{cityData.cityName} sightings</div>
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
        </TabGroup>
      </div>
    </>
  );
};

export default CityPage;
