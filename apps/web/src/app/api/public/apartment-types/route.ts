import { NextResponse } from "next/server";
import { getAllRows } from "@/lib/google/sheets";

export async function GET() {
  try {
    const { rows } = await getAllRows("apartmentTypes");
    const names = Array.from(
      new Set(
        rows
          .map((r) => (r["name"] || "").trim())
          .filter((x) => !!x)
      )
    ).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ types: names.map((name) => ({ name })) }, { status: 200 });
  } catch (e: any) {
    // If sheet not ready yet, return empty list safely.
    return NextResponse.json({ types: [] }, { status: 200 });
  }
}
