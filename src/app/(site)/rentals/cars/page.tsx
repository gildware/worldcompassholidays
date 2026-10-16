import type { Metadata } from "next";
import { RentalListing } from "../listing";

export const metadata: Metadata = { title: "Car rental" };

type Search = Record<string, string | string[] | undefined>;

export default function CarRentalsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  return <RentalListing searchParams={searchParams} lockedKind="car" />;
}
