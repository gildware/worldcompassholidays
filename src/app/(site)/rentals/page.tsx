import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RentalListing } from "./listing";

export const metadata: Metadata = pageMetadata({
  title: "Car & Bike Rental Across India",
  description:
    "Self-drive cars and bikes with daily rates, pickup points, and clear inclusions. Compare vehicles across India and book the dates you need.",
  path: "/rentals",
  keywords: ["car rental India", "bike rental India", "self drive India", "scooter rental"],
});

type Search = Record<string, string | string[] | undefined>;

export default function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} />;
}
