import { db } from "@/db";
import { cities, sightings, species } from "@/db/schema";
import { stringify } from "csv-stringify/sync";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("city");

  const query = await db
    .select({
      id: sightings.id,
      date: sightings.sightingDate,
      location: cities.cityName,
      species: species.speciesName,
      latinName: species.latinName,
    })
    .from(sightings)
    .innerJoin(species, eq(sightings.speciesId, species.id))
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .where(cityId ? eq(sightings.cityId, Number(cityId)) : undefined);

  const parsed = query.map((row) => ({
    id: row.id,
    date: row.date.toISOString(),
    location: row.location,
    species: row.species,
    latinName: row.latinName,
  }));

  const csv = stringify(parsed, {
    header: true,
    columns: ["id", "date", "location", "species", "latinName"],
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="Ticks_Sightings.csv"',
    },
  });
}
