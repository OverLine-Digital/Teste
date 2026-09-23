export const SECTORS = [
  "Technologie",
  "Médecine / Santé",
  "Habillement",
  "Agroalimentaire",
  "Environnement",
  "BTP",
  "Logistique",
] as const;

// Secteurs nécessitant une licence d'exploitation en plus des documents standards
export const REGULATED_SECTORS = ["Médecine / Santé", "Agroalimentaire"] as const;

export type Sector = (typeof SECTORS)[number];
