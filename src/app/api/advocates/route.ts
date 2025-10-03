import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { Advocate } from "../../../types/advocate";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const city = searchParams.get("city");
    const degree = searchParams.get("degree");
    const specialty = searchParams.get("specialty");
    const minExperience = searchParams.get("minExperience");
    const maxExperience = searchParams.get("maxExperience");

    // TODO: In production, uncomment this line to use database filtering
    // const data = await db.select().from(advocates).where(/* add filtering conditions */);
    
    // For now, use mock data with server-side filtering for better performance
    let data: Advocate[] = advocateData as Advocate[];

    // Apply server-side filtering for performance at scale
    if (query) {
      const searchLower = query.toLowerCase();
      data = data.filter((advocate) => {
        return (
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          advocate.city.toLowerCase().includes(searchLower) ||
          advocate.degree.toLowerCase().includes(searchLower) ||
          advocate.specialties.some((specialty: string) => 
            specialty.toLowerCase().includes(searchLower)
          ) ||
          advocate.yearsOfExperience.toString().includes(searchLower)
        );
      });
    }

    if (city) {
      data = data.filter(advocate => 
        advocate.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (degree) {
      data = data.filter(advocate => advocate.degree === degree);
    }

    if (specialty) {
      data = data.filter(advocate =>
        advocate.specialties.some((s: string) => 
          s.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }

    if (minExperience) {
      const min = parseInt(minExperience);
      if (!isNaN(min)) {
        data = data.filter(advocate => advocate.yearsOfExperience >= min);
      }
    }

    if (maxExperience) {
      const max = parseInt(maxExperience);
      if (!isNaN(max)) {
        data = data.filter(advocate => advocate.yearsOfExperience <= max);
      }
    }

    return Response.json({ 
      data,
      total: data.length,
      filters: {
        query,
        city,
        degree,
        specialty,
        minExperience,
        maxExperience
      }
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
