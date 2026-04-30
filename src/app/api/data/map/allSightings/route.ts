import { db } from "@/db";
import { cities, sightings, species as dbSpecies } from "@/db/schema";
import { and, asc, between, eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const start = params.get("start");
  const end = params.get("end");
  const species = params.get("species");

  const speciesArray = species
    ? species.split(",").map((s) => parseInt(s))
    : [];

  const results = await db
    .select({
      cityName: cities.cityName,
      nation: cities.nation,
      speciesId: sightings.speciesId,
      speciesName: dbSpecies.speciesName,
      colour: dbSpecies.colour,
      value: sql`COUNT(*)`,
      lat: cities.latitude,
      lon: cities.longitude,
    })
    .from(sightings)
    .where(
      and(
        between(sightings.sightingDate, new Date(start!), new Date(end!)),
        speciesArray.length > 0
          ? inArray(sightings.speciesId, speciesArray)
          : undefined,
      ),
    )
    .innerJoin(cities, eq(sightings.cityId, cities.id))
    .innerJoin(dbSpecies, eq(sightings.speciesId, dbSpecies.id))
    .groupBy(sightings.cityId, sightings.speciesId)
    .orderBy(asc(cities.cityName))
    .then((data) => {
      // We need to aggregate the results by city, summing the counts for each species
      const cityMap: Record<string, any> = {};
      data.forEach((row) => {
        const key = `${row.cityName}-${row.nation}`;
        if (!cityMap[key]) {
          cityMap[key] = {
            cityName: row.cityName,
            nation: row.nation,
            value: row.value,
            species: [
              {
                speciesName: row.speciesName,
                count: row.value,
                colour: row.colour,
              },
            ],
            lat: row.lat,
            lon: row.lon,
          };
        } else {
          cityMap[key].value += row.value;
          cityMap[key].species.push({
            speciesName: row.speciesName,
            count: row.value,
            colour: row.colour,
          });
        }
      });
      return Object.values(cityMap);
    });

  return NextResponse.json(results);
}
