"use client";

import { useEffect, useState } from "react";
import { LocationMapPicker } from "@/components/admin/LocationMapPicker";
import { RentalIcon } from "@/components/rentals/rental-icons";

type LocationOption = { id: string; name: string; address: string };

export type PlaceValue = {
  mode: "counter" | "delivery";
  locationId: string;
  address: string;
  lat: string;
  lng: string;
};

export function startingPlace(input: {
  counter: boolean;
  delivery: boolean;
  locations: LocationOption[];
  mode?: string;
  locationId?: string;
  address?: string;
  lat?: string;
  lng?: string;
}): PlaceValue {
  const locationId =
    input.locations.find((location) => location.id === input.locationId)?.id ||
    input.locations[0]?.id ||
    "";
  const mode =
    input.mode === "delivery" && input.delivery
      ? "delivery"
      : input.mode === "counter" && input.counter
        ? "counter"
        : !input.delivery
          ? "counter"
          : !input.counter
            ? "delivery"
            : "counter";
  return {
    mode,
    locationId,
    address: input.address ?? "",
    lat: input.lat ?? "",
    lng: input.lng ?? "",
  };
}

function CompanyPlace({ locations, invalid = false }: { locations: LocationOption[]; invalid?: boolean }) {
  const className = invalid ? "rental-book__place is-invalid" : "rental-book__place";
  if (locations.length === 0) {
    return (
      <div className={className}>
        <p>Pick up and drop</p>
        <strong>The company location is not set yet.</strong>
      </div>
    );
  }
  const location = locations[0];
  return (
    <div className={className}>
      <RentalIcon name="pin" />
      <div>
        <strong>Pick up and drop at {location.name}</strong>
        {location.address && location.address !== location.name ? <span>{location.address}</span> : null}
      </div>
    </div>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <p className="rental-book__field-error" role="alert">
      {children}
    </p>
  );
}

export function PlaceFields({
  counter,
  delivery,
  locations,
  defaultMode,
  defaultLocationId = "",
  defaultAddress = "",
  defaultLat = "",
  defaultLng = "",
  mapApiKey,
  named = false,
  placeError,
  addressError,
  mapError,
  onChange,
}: {
  counter: boolean;
  delivery: boolean;
  locations: LocationOption[];
  defaultMode?: string;
  defaultLocationId?: string;
  defaultAddress?: string;
  defaultLat?: string;
  defaultLng?: string;
  mapApiKey: string;
  named?: boolean;
  placeError?: string;
  addressError?: string;
  mapError?: string;
  onChange?: (value: PlaceValue) => void;
}) {
  const [place, setPlace] = useState(() =>
    startingPlace({
      counter,
      delivery,
      locations,
      mode: defaultMode,
      locationId: defaultLocationId,
      address: defaultAddress,
      lat: defaultLat,
      lng: defaultLng,
    }),
  );

  useEffect(() => {
    onChange?.(place);
  }, [onChange, place]);

  function patch(next: Partial<PlaceValue>) {
    setPlace((current) => ({ ...current, ...next }));
  }

  return (
    <div className="rental-book__place-fields">
      {named ? (
        <>
          <input type="hidden" name="mode" value={place.mode} />
          <input type="hidden" name="same" value="1" />
          <input type="hidden" name="returnMode" value={place.mode} />
          <input type="hidden" name="location" value={place.mode === "counter" ? place.locationId : ""} />
          <input type="hidden" name="returnLocation" value={place.mode === "counter" ? place.locationId : ""} />
          <input type="hidden" name="deliveryLat" value={place.mode === "delivery" ? place.lat : ""} />
          <input type="hidden" name="deliveryLng" value={place.mode === "delivery" ? place.lng : ""} />
        </>
      ) : null}
      {counter && delivery ? (
        <label className="rental-book__field">
          <span>
            <RentalIcon name="handover" />
            Pickup and drop
          </span>
          <select
            value={place.mode}
            onChange={(event) => patch({ mode: event.target.value === "delivery" ? "delivery" : "counter" })}
          >
            <option value="counter">At our location</option>
            <option value="delivery">At your location</option>
          </select>
        </label>
      ) : null}
      {place.mode === "counter" && locations.length > 1 ? (
        <label className={placeError ? "rental-book__field is-invalid" : "rental-book__field"}>
          <span>
            <RentalIcon name="pin" />
            Our location
          </span>
          <select
            value={place.locationId}
            aria-invalid={placeError ? true : undefined}
            onChange={(event) => patch({ locationId: event.target.value })}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.address ? `${location.name} · ${location.address}` : location.name}
              </option>
            ))}
          </select>
          {placeError ? <FieldError>{placeError}</FieldError> : null}
        </label>
      ) : null}
      {place.mode === "counter" && locations.length <= 1 ? (
        <div>
          <CompanyPlace locations={locations} invalid={Boolean(placeError)} />
          {placeError ? <FieldError>{placeError}</FieldError> : null}
        </div>
      ) : null}
      {place.mode === "delivery" ? (
        <>
          {mapApiKey ? (
            <div className={mapError ? "rental-book__map is-invalid" : "rental-book__map"}>
              <LocationMapPicker
                apiKey={mapApiKey}
                lat={place.lat}
                lng={place.lng}
                zoom={place.lat && place.lng ? 15 : 12}
                onChange={(next) => patch({ lat: next.lat, lng: next.lng })}
                onAddress={(address, source) => {
                  setPlace((current) => ({
                    ...current,
                    address: source === "pin" && current.address.trim().length >= 8 ? current.address : address,
                  }));
                }}
              />
              {mapError ? <FieldError>{mapError}</FieldError> : null}
            </div>
          ) : (
            <p className="rental-book__error">The map is not available right now. Enter the full address below.</p>
          )}
          <label className={addressError ? "rental-book__field is-invalid" : "rental-book__field"}>
            <span>
              <RentalIcon name="home" />
              Full address
            </span>
            <textarea
              name={named ? "address" : undefined}
              value={place.address}
              rows={3}
              placeholder="House, street, area, and landmark"
              aria-invalid={addressError ? true : undefined}
              onChange={(event) => patch({ address: event.target.value })}
            />
            {addressError ? <FieldError>{addressError}</FieldError> : null}
          </label>
          {named ? <input type="hidden" name="returnAddress" value={place.address} /> : null}
        </>
      ) : null}
    </div>
  );
}
