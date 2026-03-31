import { Airport } from "@/lib/db/models";

export async function GET(req) {
  const searchParams = Object.fromEntries(new URL(req.url).searchParams);
  const rawLimit = Number.parseInt(searchParams?.limit, 10);
  const limit = Number.isNaN(rawLimit) ? 10 : Math.max(rawLimit, 1);
  const searchQuery = searchParams?.searchQuery?.trim();

  try {
    if (!searchQuery) {
      const airports = await Airport.find({})
        .limit(limit)
        .select("iataCode name city -_id")
        .exec();

      return Response.json({
        success: true,
        message: "Available airports fetched successfully",
        data: airports,
      });
    }

    const escapedSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearch, "i");
    const filteredAirports = await Airport.find({
      $or: [{ iataCode: regex }, { name: regex }, { city: regex }],
    })
      .limit(limit)
      .select("iataCode name city -_id")
      .exec();

    return Response.json({
      success: true,
      message: "Available airports fetched successfully",
      data: filteredAirports,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
