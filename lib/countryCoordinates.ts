// Centroïdes approximatifs — suffisant pour un affichage par pays sur la
// carte, pas une géolocalisation précise (on ne stocke pas d'adresse GPS).
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Angola: [-11.2027, 17.8739],
  Congo: [-0.228, 15.8277],
  "République du Congo": [-0.228, 15.8277],
  "RDC": [-4.0383, 21.7587],
  "République démocratique du Congo": [-4.0383, 21.7587],
  Cameroun: [7.3697, 12.3547],
  Nigeria: [9.082, 8.6753],
  Ghana: [7.9465, -1.0232],
  "Côte d'Ivoire": [7.54, -5.5471],
  Sénégal: [14.4974, -14.4524],
  Kenya: [-0.0236, 37.9062],
  "Afrique du Sud": [-30.5595, 22.9375],
  Égypte: [26.8206, 30.8025],
  Maroc: [31.7917, -7.0926],
  Gabon: [-0.8037, 11.6094],
  Tchad: [15.4542, 18.7322],
  Zambie: [-13.1339, 27.8493],
  Tanzanie: [-6.369, 34.8888],
  Éthiopie: [9.145, 40.4897],
  Rwanda: [-1.9403, 29.8739],
  Mozambique: [-18.6657, 35.5296],
  // Pays hors Afrique autorisés (fournisseurs)
  Chine: [35.8617, 104.1954],
  Inde: [20.5937, 78.9629],
  "Émirats arabes unis": [23.4241, 53.8478],
  Dubaï: [25.2048, 55.2708],
  Japon: [36.2048, 138.2529],
  "Corée du Sud": [35.9078, 127.7669],
};

export function getCountryCoordinates(country: string | null): [number, number] | null {
  if (!country) return null;
  return COUNTRY_COORDINATES[country] ?? null;
}

// Léger décalage aléatoire pour éviter que plusieurs entreprises du même
// pays se superposent exactement au même point sur la carte
export function jitter([lat, lng]: [number, number], seed: number): [number, number] {
  const offset = ((seed % 10) - 5) * 0.15;
  return [lat + offset, lng + offset * 1.3];
}
