import { createClient } from "@/lib/supabase/server";
import AfricaBusinessMap, { type MapMarker } from "@/components/map/AfricaBusinessMap";
import { getCountryCoordinates, jitter } from "@/lib/countryCoordinates";

export default async function AfricaBusinessMapPage() {
  const supabase = await createClient();

  // Entreprises vérifiées, groupées par pays
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, country")
    .eq("verification_status", "verified")
    .limit(200);

  // Capacités transport disponibles = corridors actifs
  const { data: capacities } = await supabase
    .from("capacities")
    .select("id, origin_country, destination_country, origin_city, destination_city")
    .eq("type", "transport")
    .eq("status", "disponible")
    .limit(100);

  // Demandes de partenaire ouvertes = opportunités
  const { data: partnerRequests } = await supabase
    .from("business_partner_requests")
    .select("id, target_country, partner_type")
    .eq("status", "open")
    .limit(100);

  const markers: MapMarker[] = [];

  companies?.forEach((c, i) => {
    const coords = getCountryCoordinates(c.country);
    if (!coords) return;
    markers.push({
      id: `company-${c.id}`,
      lat: jitter(coords, i)[0],
      lng: jitter(coords, i)[1],
      label: `${c.name} — Entreprise vérifiée`,
      kind: "entreprise",
    });
  });

  capacities?.forEach((cap, i) => {
    const coords = getCountryCoordinates(cap.origin_country);
    if (!coords) return;
    markers.push({
      id: `capacity-${cap.id}`,
      lat: jitter(coords, i + 50)[0],
      lng: jitter(coords, i + 50)[1],
      label: `Transport ${cap.origin_city ?? cap.origin_country} → ${cap.destination_city ?? cap.destination_country}`,
      kind: "corridor",
    });
  });

  partnerRequests?.forEach((r, i) => {
    const coords = getCountryCoordinates(r.target_country);
    if (!coords) return;
    markers.push({
      id: `partner-${r.id}`,
      lat: jitter(coords, i + 100)[0],
      lng: jitter(coords, i + 100)[1],
      label: `Recherche ${r.partner_type} — ${r.target_country}`,
      kind: "opportunite",
    });
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="font-display text-2xl text-ink">Africa Business Map</h1>
        <p className="font-sans text-sm text-ink/60 mt-1">
          {companies?.length ?? 0} entreprises vérifiées · {capacities?.length ?? 0} capacités de
          transport disponibles · {partnerRequests?.length ?? 0} opportunités ouvertes.
        </p>
      </div>
      <div className="flex-1">
        <AfricaBusinessMap markers={markers} />
      </div>
    </div>
  );
}
