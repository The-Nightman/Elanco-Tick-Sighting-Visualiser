import csv from "csv-parser";
import fs from "fs";
import { db } from ".";
import { cities, species as dbSpecies, sightings } from "./schema";
import ukTickSpecies from "./data/ukTickSpecies.json";
import ukCities from "./data/ukCities.json";
import { like, or } from "drizzle-orm";
import { generateSightingId } from "@/utils/generateSightingId";
import { validateIsoString } from "@/utils/validateIsoString";

interface CsvSighting {
  id: string | "null";
  date: string | "null";
  location: string | "null";
  species: string | "null";
  latinName: string | "null";
}

interface parsedSighting<T> {
  id: string;
  sightingDate: T;
  cityId: number;
  speciesId: number;
}

/**
 * Seeds the database with initial data from JSON files and CSV file.
 *
 * Performs the following operations:
 * 1. Populates the species table with UK tick species data if empty
 * 2. Populates the cities table with UK cities data if empty
 * 3. Parses and imports tick sighting data from a CSV file, performing:
 *    - ID validation and generation for missing/incomplete/excessive IDs
 *    - Location and date validation (drops sightings with missing data on primary metrics)
 *    - Species name/latin name matching with LIKE matching for misspellings
 *    - City name matching with LIKE matching for misspellings
 *    - DateTime validation (currently only corrects time components if out of range)
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when all seeding operations complete
 *
 * @remarks
 * - Cities and species are only seeded if their respective tables are empty to prevent duplicate entries
 * - Only processes sightings if the sightings table is empty
 *
 * @todo Consider integrating towns and counties in future due to regions without city status
 */
export const seedDatabase = async (): Promise<void> => {
  const results: CsvSighting[] = [];

  // Seed the species table with the UK tick species if empty
  // Tick species data sourced from https://www.gov.uk/guidance/tick-species-profiles
  if ((await db.select().from(dbSpecies)).length === 0) {
    await db.insert(dbSpecies).values(ukTickSpecies);
  }

  // List of UK cities sourced from https://www.gov.uk/government/publications/list-of-cities/list-of-cities-html
  // TODO: Consider integrating towns and counties in future due to regions without city status
  if ((await db.select().from(cities)).length === 0) {
    await db.insert(cities).values(
      ukCities.map((city) => ({
        cityName: city.cityName,
        nation: city.nation as
          | "England"
          | "Scotland"
          | "Wales"
          | "Northern Ireland",
        latitude: city.latitude.toFixed(4),
        longitude: city.longitude.toFixed(4),
      })),
    );
  }

  if ((await db.select().from(sightings)).length === 0) {
    fs.createReadStream("src/db/data/Tick_Sightings.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const speciesRecords = await db.select().from(dbSpecies);

        const cityRecords = await db.select().from(cities);

        const parsedSightings: parsedSighting<Date>[] = [];

        for (const sighting of results) {
          const sightingData: parsedSighting<string> = {
            id: sighting.id,
            sightingDate: sighting.date,
            cityId: -1,
            speciesId: -1,
          };

          if (sightingData.id == "null" || !sightingData.id) {
            sightingData.id = generateSightingId();

            console.warn(
              `Sighting with missing ID found. Generated new ID: ${sightingData.id}`,
            );
          } else if (sightingData.id.substring(0, 20).length !== 20) {
            sightingData.id =
              sightingData.id.substring(0, 20) +
              generateSightingId(sightingData.id.length);

            console.warn(
              `Incomplete sighting ID ${sighting.id}. Appended with random characters to ensure uniqueness: ${sightingData.id}`,
            );
          }

          // location is the primary data metric, if it is missing then the sighting report is junk data
          if (sighting.location == "null" || sighting.date == "null") {
            console.warn(
              `Dropping sighting ${sightingData.id} has missing location or date data and will be skipped.`,
            );
            console.warn(`Sighting data: ${JSON.stringify(sighting)}`);
            continue;
          }

          const sightingSpecies = speciesRecords.find(
            (record) =>
              record.speciesName === sighting.species ||
              record.latinName === sighting.latinName,
          );

          const sightingCity = cityRecords.find(
            (record) => record.cityName === sighting.location,
          );

          if (!sightingSpecies) {
            const [speciesRecord] = await db
              .select()
              .from(dbSpecies)
              // LIKE query will match misspelled species names in the CSV to the correct species in the database
              .where(
                or(
                  like(dbSpecies.speciesName, `%${sighting.species}%`),
                  like(dbSpecies.latinName, `%${sighting.latinName}%`),
                ),
              )
              .limit(1);

            console.warn(
              `Sighting ${sightingData.id} has an unrecognized species "${sighting.species}" (${sighting.latinName}). Attempting to match with a LIKE query...`,
            );
            console.warn(
              `Matched species: ${speciesRecord.speciesName} (${speciesRecord.latinName})`,
            );

            sightingData.speciesId = speciesRecord.id;
          } else {
            sightingData.speciesId = sightingSpecies.id;
          }

          if (!sightingCity) {
            const [cityRecord] = await db
              .select()
              .from(cities)
              // LIKE query will match misspelled city names in the CSV to the correct city in the database
              .where(like(cities.cityName, `%${sighting.location}%`))
              .limit(1);

            console.warn(
              `Sighting ${sightingData.id} has an unrecognized location "${sighting.location}". Attempting to match with a LIKE query...`,
            );
            console.warn(`Matched city: ${cityRecord.cityName}`);

            sightingData.cityId = cityRecord.id;
          } else {
            sightingData.cityId = sightingCity.id;
          }

          parsedSightings.push({
            id: sightingData.id.substring(0, 20),
            sightingDate: new Date(
              validateIsoString(sightingData.sightingDate),
            ),
            cityId: sightingData.cityId,
            speciesId: sightingData.speciesId,
          });
        }

        await db.insert(sightings).values(parsedSightings);
      });
  }
};
