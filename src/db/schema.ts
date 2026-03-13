import { datetime, int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const species = mysqlTable("Species", {
  id: int("Id").primaryKey(),
  speciesName: varchar("SpeciesName", { length: 255 }).notNull().unique(),
  latinName: varchar("LatinName", { length: 255 }).notNull().unique(),
});

const citiesEnum = mysqlEnum(["England", "Scotland", "Wales", "Northern Ireland"]);

export const cities = mysqlTable("Cities", {
  id: int("Id").primaryKey(),
  cityName: varchar("CityName", { length: 255 }).notNull(),
  nation: citiesEnum.notNull(),
});

export const sightings = mysqlTable("Sightings", {
  id: varchar("Id", { length: 20 }).primaryKey(),
  sightingDate: datetime().notNull(),
  speciesId: int("SpeciesId").notNull().references(() => species.id),
  cityId: int("CityId").notNull().references(() => cities.id),
});
