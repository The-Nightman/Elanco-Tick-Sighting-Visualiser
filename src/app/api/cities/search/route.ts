import { db } from "@/db";
import { cities } from "@/db/schema";
import { asc, like, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json([]);
  }

  const normalisedQuery = query.toLowerCase();

  const results = await db
    .select({
      id: cities.id,
      cityName: cities.cityName,
      nation: cities.nation,
    })
    .from(cities)
    .where(like(sql`LOWER(${cities.cityName})`, `%${normalisedQuery}%`))
    .orderBy(asc(cities.cityName))
    .limit(8);

  return NextResponse.json(results);
}
