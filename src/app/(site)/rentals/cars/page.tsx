import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RentalListing } from "../listing";

export const metadata: Metadata = pageMetadata({
  title: "Self-Drive Car Rental in India",
  description:
    "Rent self-drive cars across India with seat counts, daily rates, and pickup locations. Filter by city, dates, and the car type you need.",
  path: "/rentals/cars",
  keywords: ["car rental India", "self drive car", "hire car India"],
});

type Search = Record<string, string | string[] | undefined>;

export default function CarRentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} lockedKind="car" />;
}
