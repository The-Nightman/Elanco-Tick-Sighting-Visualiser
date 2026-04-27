import { db } from "@/db";
import { cities } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ CityId: string }> },
) {
  const { CityId } = await params;

  const [cityQuery] = await db
    .select({
      id: cities.id,
      cityName: cities.cityName,
      nation: cities.nation,
    })
    .from(cities)
    .where(eq(cities.id, Number(CityId)))
    .orderBy(asc(cities.cityName))
    .limit(1);

  return NextResponse.json(cityQuery);
}
