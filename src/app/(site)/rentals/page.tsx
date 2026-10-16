import type { Metadata } from "next";
import { RentalListing } from "./listing";

export const metadata: Metadata = { title: "Rentals" };

type Search = Record<string, string | string[] | undefined>;

export default function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} />;
}
