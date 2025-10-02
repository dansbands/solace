import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { Advocate } from "../../../types/advocate";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("query") || "";
    const city = searchParams.get("city");
    const degree = searchParams.get("degree");
    const specialty = searchParams.get("specialty");
    const minExperience = searchParams.get("minExperience");
    const maxExperience = searchParams.get("maxExperience");
    const sort = searchParams.get("sort") || "";
    const direction = searchParams.get("direction") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // TODO: In production, uncomment this line to use database filtering
    // const data = await db.select().from(advocates).where(/* add filtering conditions */);
    
    // For now, use mock data with server-side filtering for better performance
    let data: Advocate[] = advocateData as Advocate[];

    // Apply server-side filtering for performance at scale
    if (search) {
      const searchLower = search.toLowerCase();
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

    // Sort data
    if (sort) {
      data.sort((a, b) => {
        let aValue = a[sort as keyof Advocate];
        let bValue = b[sort as keyof Advocate];

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return direction === "asc" ? 1 : -1;
        if (bValue === undefined) return direction === "asc" ? -1 : 1;

        // Handle different data types
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Calculate total before pagination
    const total = data.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return Response.json({ 
      data: paginatedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        search,
        city,
        degree,
        specialty,
        minExperience,
        maxExperience,
        sort,
        direction
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
