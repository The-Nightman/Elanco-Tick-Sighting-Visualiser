import { datetime, decimal, int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { boolean } from "drizzle-orm/mysql-core";

export const species = mysqlTable("Species", {
  id: int("Id").autoincrement().primaryKey(),
  speciesName: varchar("SpeciesName", { length: 255 }).notNull().unique(),
  latinName: varchar("LatinName", { length: 255 }).notNull().unique(),
  colour: varchar("Colour", { length: 7 }).notNull(),
  invasiveStatus: boolean("InvasiveStatus").notNull(),
});

const citiesEnum = mysqlEnum(["England", "Scotland", "Wales", "Northern Ireland"]);

export const cities = mysqlTable("Cities", {
  id: int("Id").autoincrement().primaryKey(),
  cityName: varchar("CityName", { length: 255 }).notNull(),
  nation: citiesEnum.notNull(),
  latitude: decimal({ precision: 6, scale: 4 }).notNull(),
  longitude: decimal({ precision: 7, scale: 4 }).notNull(),
});

export const sightings = mysqlTable("Sightings", {
  id: varchar("Id", { length: 20 }).primaryKey(),
  sightingDate: datetime().notNull(),
  speciesId: int("SpeciesId").notNull().references(() => species.id),
  cityId: int("CityId").notNull().references(() => cities.id),
});
