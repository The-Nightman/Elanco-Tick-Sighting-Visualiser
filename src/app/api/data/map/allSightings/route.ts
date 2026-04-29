import { db } from "@/db";
import { cities, sightings } from "@/db/schema";
import { and, asc, between, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const start = params.get("start");
  const end = params.get("end");
  const species = params.get("species");

  const speciesArray = species ? species.split(",").map((s) => parseInt(s)) : [];

  const results = await db
    .select({
      cityName: cities.cityName,
      nation: cities.nation,
      value: sql`COUNT(*)`,
      lat: cities.latitude,
      lon: cities.longitude,
    })
    .from(sightings)
    .where(
      and(
        between(sightings.sightingDate, new Date(start!), new Date(end!)),
        ...(speciesArray.length > 0
          ? [inArray(sightings.speciesId, speciesArray)]
          : [])
      )
    )
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .groupBy(cities.id)
    .orderBy(asc(cities.cityName));

  return NextResponse.json(results);
}
