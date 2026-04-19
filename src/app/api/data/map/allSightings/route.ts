import { db } from "@/db";
import { cities, sightings } from "@/db/schema";
import { asc, between, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const start = params.get("start");
  const end = params.get("end");

  const results = await db
    .select({
      cityName: cities.cityName,
      nation: cities.nation,
      value: sql`COUNT(*)`,
      lat: cities.latitude,
      lon: cities.longitude,
    })
    .from(sightings)
    .where(between(sightings.sightingDate, new Date(start!), new Date(end!)))
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .groupBy(cities.id)
    .orderBy(asc(cities.cityName));

  return NextResponse.json(results);
}
