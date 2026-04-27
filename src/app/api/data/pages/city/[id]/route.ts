import { db } from "@/db";
import { sightings, species } from "@/db/schema";
import { CitypageData } from "@/interfaces/CitypageData";
import { HistogramData } from "@/interfaces/HistogramData";
import { OverviewCardsCityData } from "@/interfaces/OverviewCardsCityData";
import { StackedHistogramData } from "@/interfaces/StackedHistogramData";
import { TickCardData } from "@/interfaces/TickCardData";
import { and, asc, between, eq, max, min, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { searchParams } = new URL(request.url);
  const { id } = await params;
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
        eq(sightings.cityId, Number(id)),
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
    .where(
      and(
        eq(sightings.cityId, Number(id)),
        between(sightings.sightingDate, startOfYear, endOfYear),
      ),
    )
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

  const [sightingsReports] = await db
    .select({
      sightingsPastMonth: db.$count(
        sightings,
        and(
          eq(sightings.cityId, Number(id)),
          between(
            sightings.sightingDate,
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date(),
          ),
        ),
      ),
      sightingsPastQuarter: db.$count(
        sightings,
        and(
          eq(sightings.cityId, Number(id)),
          between(
            sightings.sightingDate,
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            new Date(),
          ),
        ),
      ),
      sightingsPastYear: db.$count(
        sightings,
        and(
          eq(sightings.cityId, Number(id)),
          between(
            sightings.sightingDate,
            new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            new Date(),
          ),
        ),
      ),
      reportsThisWeek: db.$count(
        sightings,
        and(
          eq(sightings.cityId, Number(id)),
          between(
            sightings.sightingDate,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date(),
          ),
        ),
      ),
    })
    .from(sightings)
    .where(eq(sightings.cityId, Number(id)));

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
      and(
        eq(sightings.cityId, Number(id)),
        between(sightings.sightingDate, new Date(year - 2, 0, 1), endOfYear),
      ),
    );

  const [peakSeason] = await db
    .select({
      quarter: sql<number>`QUARTER(${sightings.sightingDate})`,
      totalSightings: sql<number>`SUM(1)`,
    })
    .from(sightings)
    .where(
      and(
        eq(sightings.cityId, Number(id)),
        sql`YEAR(${sightings.sightingDate}) = ${year}`,
      ),
    )
    .groupBy(sql`QUARTER(${sightings.sightingDate})`)
    .orderBy(sql`SUM(1) DESC`)
    .limit(1);

  const [yearMostAffectedSpecies] = await db
    .select({
      speciesName: species.speciesName,
      sightingCount: sql<number>`COUNT(*)`,
    })
    .from(sightings)
    .where(
      and(
        eq(sightings.cityId, Number(id)),
        between(sightings.sightingDate, startOfYear, endOfYear),
      ),
    )
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
    .where(
      and(
        eq(sightings.cityId, Number(id)),
        eq(sightings.speciesId, species.id),
      ),
    )
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

  const overviewCardsData: OverviewCardsCityData = {
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
    mostAffectedSpecies: {
      yearMostAffectedSpecies,
      maxMostAffectedSpecies,
    },
  };

  const citypageData: CitypageData = {
    tickCardData,
    histogramData,
    stackedHistogramData,
    overviewCardsData,
  };

  return NextResponse.json(citypageData);
}
