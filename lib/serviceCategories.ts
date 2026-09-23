export const SERVICE_CATEGORIES = [
  "Design graphique",
  "Nettoyage professionnel",
  "Relocation / Déménagement d'employés",
  "Sécurité",
  "Recrutement",
  "Formation",
  "Conseil",
  "Traduction",
  "Marketing / Communication",
  "Juridique",
  "Comptabilité",
  "Transport de personnel",
  "Restauration collective",
  "Maintenance / Entretien",
  "Impression / Signalétique",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
