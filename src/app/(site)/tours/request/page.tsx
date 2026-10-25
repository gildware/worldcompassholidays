import { ServiceRequestPage, serviceRequestMetadata } from "@/components/service-request/ServiceRequestPage";

export const metadata = serviceRequestMetadata("tour");

export default function TourRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <ServiceRequestPage kind="tour" searchParams={searchParams} />;
}
