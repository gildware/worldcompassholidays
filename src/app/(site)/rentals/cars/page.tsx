import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { RentalListing } from "../listing";

export const metadata: Metadata = pageMetadata({
  title: "Car rental",
  description:
    "Self-drive cars with seats, daily rates, and pickup locations. Filter by city, dates, and the kind of car you need.",
  path: "/rentals/cars",
});

type Search = Record<string, string | string[] | undefined>;

export default function CarRentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} lockedKind="car" />;
}
