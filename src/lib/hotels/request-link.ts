export function hotelRequestHref(input: {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}) {
  const params = new URLSearchParams();
  const destination = input.destination?.trim();
  if (destination) params.set("destination", destination);
  if (input.checkIn) params.set("checkIn", input.checkIn);
  if (input.checkOut) params.set("checkOut", input.checkOut);
  if (input.adults) params.set("adults", String(input.adults));
  if (input.children) params.set("children", String(input.children));
  if (input.rooms) params.set("rooms", String(input.rooms));
  const query = params.toString();
  return query ? `/hotels/request?${query}` : "/hotels/request";
}
