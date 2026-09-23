// Centroïdes approximatifs — suffisant pour positionner un marqueur par
// pays sur la carte sans dépendre d'une API de géocodage payante ou à clé.
export const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Angola: [-11.2027, 17.8739],
  Congo: [-0.228, 15.8277],
  "Congo-Brazzaville": [-0.228, 15.8277],
  RDC: [-4.0383, 21.7587],
  "République Démocratique du Congo": [-4.0383, 21.7587],
  Cameroun: [7.3697, 12.3547],
  Nigeria: [9.082, 8.6753],
  Ghana: [7.9465, -1.0232],
  "Côte d'Ivoire": [7.54, -5.5471],
  Sénégal: [14.4974, -14.4524],
  Kenya: [-0.0236, 37.9062],
  "Afrique du Sud": [-30.5595, 22.9375],
  Égypte: [26.8206, 30.8025],
  Maroc: [31.7917, -7.0926],
  Chine: [35.8617, 104.1954],
  Inde: [20.5937, 78.9629],
  Dubaï: [25.2048, 55.2708],
  "Émirats Arabes Unis": [23.4241, 53.8478],
  Japon: [36.2048, 138.2529],
  "Corée du Sud": [35.9078, 127.7669],
};

export function getCountryCoordinates(country: string | null): [number, number] | null {
  if (!country) return null;
  return COUNTRY_COORDINATES[country] ?? null;
}
