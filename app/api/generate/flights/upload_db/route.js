import primaryAirportData from "@/lib/db/generateForDB/primaryData/airportsData.json";
import primaryAirplanedata from "@/lib/db/generateForDB/primaryData/airplaneData.json";
import primaryAirlinedata from "@/lib/db/generateForDB/primaryData/airlinesData.json";

import {
  generateAirlineFlightPricesDB,
  generateAirlinesDB,
  generateAirplanesDB,
  generateAirportsDB,
  generateFlightsDB,
} from "@/lib/db/generateForDB/flights/generateFlights";
import { deleteManyDocs } from "@/lib/db/deleteOperationDB";
import { createManyDocs } from "@/lib/db/createOperationDB";

export async function POST(req) {
  if (
    req.headers.get("Authorization") !==
    `Bearer ${process.env.API_SECRET_TOKEN}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const searchParams = new URL(req.url).searchParams;
    const rawDays = Number.parseInt(searchParams.get("days"), 10);
    const days =
      Number.isNaN(rawDays) || rawDays < 1
        ? 10
        : Math.min(rawDays, 30);

    console.log("Uploading flights DB...");
    await uploadFlightsDB(days);
    console.log("Flights DB uploaded successfully.");
    return Response.json({
      success: true,
      message: `Flights DB uploaded successfully for ${days} day(s).`,
    });
  } catch (error) {
    console.error("Error uploading flights DB:", error);
    return Response.json(
      {
        success: false,
        message: "Error uploading flights DB",
      },
      { status: 500 },
    );
  }
}

async function uploadFlightsDB(days = 10) {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in .env file.");
  }
  const airport = await generateAirportsDB(primaryAirportData);
  const { airplaneData: airplane, seatData: seat } =
    await generateAirplanesDB(primaryAirplanedata);
  const airline = await generateAirlinesDB(primaryAirlinedata);
  const airlineFlightPrices =
    await generateAirlineFlightPricesDB(primaryAirlinedata);
  const flight = await generateFlightsDB(
    days,
    airport,
    airplane,
    airline,
    airlineFlightPrices,
  );

  let flightItinerary = [];
  let flightSegments = [];
  let flightSeats = [];

  for (const f of flight) {
    flightItinerary = flightItinerary.concat(f.flightItinerary);
    flightSegments = flightSegments.concat(f.flightSegments);
    flightSeats = flightSeats.concat(f.flightSeats);
  }

  const data = {
    airport,
    airplane,
    airline,
    AirlineFlightPrice: airlineFlightPrices,
    FlightItinerary: flightItinerary,
    FlightSegment: flightSegments,
    FlightSeat: flightSeats,
  };

  const batchSizeByModel = {
    airport: 500,
    airplane: 500,
    airline: 500,
    AirlineFlightPrice: 1000,
    FlightItinerary: 500,
    FlightSegment: 500,
    FlightSeat: 1000,
  };

  for (const [key, value] of Object.entries(data)) {
    await deleteManyDocs(key);
    console.log("deleted", key);
    // create
    await createManyDocs(key, value, {
      batchSize: batchSizeByModel[key] || 500,
      ordered: false,
    });
    console.log("created", key);
  }

  return data;
}
