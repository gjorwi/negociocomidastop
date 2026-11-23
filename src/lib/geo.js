export async function reverseGeocode({ lat, lng }) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    "accept-language": "es",
  });
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) return "";
  const data = await response.json();
  return data.display_name || "";
}
