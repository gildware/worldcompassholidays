import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RentalListing } from "./listing";

export const metadata: Metadata = pageMetadata({
  title: "Car and bike rental",
  description:
    "Self-drive cars and bikes with daily rates, pickup points, and what is included. Compare vehicles and book the dates you need.",
  path: "/rentals",
});

type Search = Record<string, string | string[] | undefined>;

export default function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} />;
}
