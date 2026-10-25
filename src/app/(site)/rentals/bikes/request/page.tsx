import { ServiceRequestPage, serviceRequestMetadata } from "@/components/service-request/ServiceRequestPage";

export const metadata = serviceRequestMetadata("bike");

export default function BikeRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <ServiceRequestPage kind="bike" searchParams={searchParams} />;
}
