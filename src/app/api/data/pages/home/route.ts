import { db } from "@/db";
import { cities, sightings, species } from "@/db/schema";
import { HistogramData } from "@/interfaces/HistogramData";
import { HomepageData } from "@/interfaces/HomepageData";
import { HorizonData } from "@/interfaces/HorizonData";
import { OverviewCardsHomeData } from "@/interfaces/OverviewCardsHomeData";
import { StackedHistogramData } from "@/interfaces/StackedHistogramData";
import { TickCardData } from "@/interfaces/TickCardData";
import { and, asc, between, eq, max, min, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chosenYear: string | null = searchParams.get("viewYear");

  let year: number;
  let startOfYear: Date;
  let endOfYear: Date;

  if (chosenYear === "max") {
    const [maxYearResult] = await db
      .select({
        startOfData: min(sightings.sightingDate),
      })
      .from(sightings);

    year = maxYearResult.startOfData!.getFullYear();

    startOfYear = new Date(year, 0, 1);
    endOfYear = new Date(new Date().getFullYear(), 11, 31);
  } else {
    year = chosenYear ? Number(chosenYear) : new Date().getFullYear();
    startOfYear = new Date(year, 0, 1);
    endOfYear = new Date(year, 11, 31);
  }

  /*
   * QUERIES
   *
   *
   *
   *
   * there is a lot so this marker is here to help navigate visually, it was hard enough for me
   * -KB
   */
  const tickCardData: TickCardData[] = await db
    .select({
      sightings: sql<number>`COUNT(${sightings.id})`,
      species: species.speciesName,
      latinName: species.latinName,
      lastReported: max(sightings.sightingDate),
    })
    .from(species)
    .leftJoin(
      sightings,
      and(
        eq(sightings.speciesId, species.id),
        between(sightings.sightingDate, startOfYear, endOfYear),
      ),
    )
    .groupBy(species.id);

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
      colour: species.colour,
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
        { date: string; data: { speciesName: string; colour: string; count: number }[] }
      > = {};

      data.forEach(({ date, speciesName, colour, count }) => {
        if (!groupedData[date]) {
          groupedData[date] = { date, data: [] };
        }
        groupedData[date].data.push({ speciesName, colour, count });
      });

      return Object.values(groupedData);
    });

  const cityData = await db.select().from(cities);

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

  const [sightingsReports] = await db
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
      currentMonth: sql<number>`SUM(${sightings.sightingDate} >= ${startOfYear} AND ${sightings.sightingDate} < ${endOfYear})`,
      previousMonth: sql<number>`SUM(${sightings.sightingDate} >= ${new Date(year - 1, 0, 1)} AND ${sightings.sightingDate} < ${startOfYear})`,
      currentSixMonths: sql<number>`SUM(${sightings.sightingDate} >= ${new Date(year, 6, 1)} AND ${sightings.sightingDate} < ${endOfYear})`,
      previousSixMonths: sql<number>`SUM(${sightings.sightingDate} >= ${new Date(year - 1, 6, 1)} AND ${sightings.sightingDate} < ${new Date(year, 6, 1)})`,
      currentYear: sql<number>`SUM(${sightings.sightingDate} >= ${startOfYear} AND ${sightings.sightingDate} < ${endOfYear})`,
      previousYear: sql<number>`SUM(${sightings.sightingDate} >= ${new Date(year - 1, 0, 1)} AND ${sightings.sightingDate} < ${startOfYear})`,
    })
    .from(sightings)
    .where(
      between(sightings.sightingDate, new Date(year - 2, 0, 1), endOfYear),
    );

  const [peakSeason] = await db
    .select({
      quarter: sql<number>`QUARTER(${sightings.sightingDate})`,
      totalSightings: sql<number>`SUM(1)`,
    })
    .from(sightings)
    .where(sql`YEAR(${sightings.sightingDate}) = ${year}`)
    .groupBy(sql`QUARTER(${sightings.sightingDate})`)
    .orderBy(sql`SUM(1) DESC`)
    .limit(1);

  const risingLocationCounts = await db
    .select({
      location: cities.cityName,
      recentCount: sql<number>`SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 30 DAY AND ${sightings.sightingDate} < NOW() THEN 1 ELSE 0 END)`,
      previousCount: sql<number>`SUM(CASE WHEN ${sightings.sightingDate} >= NOW() - INTERVAL 60 DAY AND ${sightings.sightingDate} < NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END)`,
    })
    .from(sightings)
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .where(sql`${sightings.sightingDate} >= NOW() - INTERVAL 60 DAY`)
    .groupBy(cities.cityName);

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

  /*
   * HELPER FUNCTIONS
   *
   *
   *
   *
   *
   *
   */
  const horizonData = cityData
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
    .sort((a, b) => a.cityName.localeCompare(b.cityName));

  const topRisingLocations = risingLocationCounts
    .map((item) => {
      const recentCount = item.recentCount;
      const previousCount = item.previousCount;

      const locationObj: {
        location: string;
        recentCount: number;
        previousCount: number;
        rateOfChange: number | null;
      } = {
        location: item.location,
        recentCount,
        previousCount,
        rateOfChange: 0,
      };

      if (previousCount === 0) {
        locationObj.rateOfChange = recentCount > 0 ? Infinity : null; // Assign Infinity for new data, this will keep it at the top of the list which *technically* is correct
      } else {
        locationObj.rateOfChange =
          ((recentCount - previousCount) / previousCount) * 100;
      }

      return locationObj;
    })
    .filter((item) => item.rateOfChange !== null && item.rateOfChange >= 0) // This is RISING locations, null and shrinking need not apply
    .sort((a, b) => b.rateOfChange! - a.rateOfChange!) // Infinity should always come first so this should work fine
    .slice(0, 3);

  // Aggregate trendData results into a more cohesive object for us with the percentage of change and direction, this solution is much better than the previous query
  const getTrend = (current: number, previous: number, threshold = 0.1) => {
    const trendObj = {
      trend: "",
      percentageChange: NaN,
    };

    const change = (current - previous) / previous;

    if (Math.abs(change) < threshold) {
      trendObj.trend = "Stable";
    } else if (change >= threshold) {
      trendObj.trend = "Increasing";
    } else {
      trendObj.trend = "Decreasing";
    }

    return { ...trendObj, percentageChange: change * 100 };
  };

  const overviewCardsData: OverviewCardsHomeData = {
    sightingsReports,
    trendData: {
      pastMonth: getTrend(trendData.currentMonth, trendData.previousMonth),
      pastSixMonths: getTrend(
        trendData.currentSixMonths,
        trendData.previousSixMonths,
      ),
      pastYear: getTrend(trendData.currentYear, trendData.previousYear),
    },
    peakSeason: peakSeason
      ? {
          quarter: peakSeason.quarter,
          totalSightings: peakSeason.totalSightings,
        }
      : {
          quarter: null,
          totalSightings: 0,
        },
    topRisingLocations,
    mostAffectedSpecies: {
      yearMostAffectedSpecies,
      maxMostAffectedSpecies,
    },
  };

  const homepageData: HomepageData = {
    tickCardData,
    histogramData,
    stackedHistogramData,
    horizonData,
    overviewCardsData,
  };

  return NextResponse.json(homepageData);
}
