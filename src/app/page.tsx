"use server";
import { db } from "@/db";
import HorizonChart from "./components/charts/HorizonChart";
import { HorizonData } from "@/interfaces/HorizonData";
import { cities, sightings } from "@/db/schema";
import { asc, between, eq, sql } from "drizzle-orm";

const page = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

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
      <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4">
        <div className="w-full h-fit bg-gray-500/70">
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
      </div>
    </>
  );
};

export default page;
