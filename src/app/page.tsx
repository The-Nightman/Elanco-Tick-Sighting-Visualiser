"use server"

import { asc, between, sql } from "drizzle-orm";
import Histogram from "./components/charts/histogram/Histogram";
import { sightings } from "@/db/schema";
import { db } from "@/db";

const page = async() => {
    const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
    const histogramMonthBucket = sql<string>`DATE_FORMAT(${sightings.sightingDate}, '%Y-%m-01')`;

  const histogramData = await db.select({
    date: histogramMonthBucket,
    count: sql<number>`COUNT(*)`,
  })
  .from(sightings)
  .where(between(sightings.sightingDate, startOfYear, endOfYear))
  .groupBy(histogramMonthBucket)
  .orderBy(asc(histogramMonthBucket));
  
  return <>
    <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4">
      <Histogram data={histogramData} />
    </div>
  </>;
};

export default page;
