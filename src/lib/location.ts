import type { FarmLocation } from "@/lib/types";

type OpenMeteoReverseGeocodeResponse = {
  results?: Array<{
    name?: string;
    admin1?: string;
    country?: string;
  }>;
};

export function formatFarmLocation(location?: FarmLocation | null) {
  if (!location) {
    return "Harare, Zimbabwe";
  }

  return location.label ?? ([location.city, location.region, location.country].filter(Boolean).join(", ") || "Your farm");
}

export async function reverseGeocodeFarmLocation(latitude: number, longitude: number): Promise<FarmLocation | null> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
  );

  if (!response.ok) {
    return {
      latitude,
      longitude,
      label: "Your farm",
    };
  }

  const data = (await response.json()) as OpenMeteoReverseGeocodeResponse;
  const result = data.results?.[0];

  if (!result) {
    return {
      latitude,
      longitude,
      label: "Your farm",
    };
  }

  return {
    latitude,
    longitude,
    city: result.name,
    region: result.admin1,
    country: result.country,
    label: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
  };
}
