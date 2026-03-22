"use server";

import TickCountCard from "@/component/cards/TickCountCard";
import { db } from "@/db";
import { sightings, species } from "@/db/schema";
import { eq, max } from "drizzle-orm";
import { TickCardData } from "./interface/TickCardData";

const page = async () => {
  const tickCardData: TickCardData[] = await db
    .select({
      sightings: db.$count(sightings, eq(sightings.speciesId, species.id)),
      species: species.speciesName,
      latinName: species.latinName,
      lastReported: max(sightings.sightingDate),
    })
    .from(sightings)
    .innerJoin(species, eq(sightings.speciesId, species.id))
    .groupBy(species.id);

  return (
    <>
      <div className="flex flex-col w-full lg:max-w-3/4 self-center p-4">
        <div className="w-full h-72 bg-gray-500/70">
          <span>placeholder</span>
        </div>
        <div>
          {tickCardData.map((item, index) => (
            <TickCountCard
              key={`tickCard-${item.species}-${index}-TickCountCard`}
              data={item}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default page;
