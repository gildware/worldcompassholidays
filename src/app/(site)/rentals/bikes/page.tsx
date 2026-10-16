import type { Metadata } from "next";
import { RentalListing } from "../listing";

export const metadata: Metadata = { title: "Bike rental" };

type Search = Record<string, string | string[] | undefined>;

export default function BikeRentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} lockedKind="bike" />;
}
