import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RentalListing } from "../listing";

export const metadata: Metadata = pageMetadata({
  title: "Bike rental",
  description:
    "Motorbikes and scooters with daily rates and pickup locations. Filter by city and dates, then book the bike you want.",
  path: "/rentals/bikes",
});

type Search = Record<string, string | string[] | undefined>;

export default function BikeRentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} lockedKind="bike" />;
}
