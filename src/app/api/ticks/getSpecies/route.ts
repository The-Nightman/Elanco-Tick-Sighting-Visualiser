import { db } from "@/db";
import { species } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = await db.select().from(species);

  return NextResponse.json(query);
}
