import { ServiceRequestPage, serviceRequestMetadata } from "@/components/service-request/ServiceRequestPage";

export const metadata = serviceRequestMetadata("car");

export default function CarRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <ServiceRequestPage kind="car" searchParams={searchParams} />;
}
