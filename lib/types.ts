export type UserRole =
  | "entreprise"
  | "fournisseur"
  | "acheteur"
  | "distributeur"
  | "investisseur"
  | "fabricant"
  | "commercant"
  | "vendeur"
  | "transporteur"
  | "grossiste"
  | "importateur"
  | "commercial"
  | "gestionnaire_entrepot"
  | "representant_local"
  | "freelance"
  | "prestataire_service";

export type AccountType = "entreprise" | "individuel";

export type OnboardingStep =
  | "email_pending"
  | "qui_etes_vous"
  | "verification_pending"
  | "complete";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole | null;
  account_type: AccountType | null;
  onboarding_step: OnboardingStep;
  country: string | null;
  city: string | null;
  preferred_language_code: string;
  reception_languages: string[];
};

export type Language = {
  code: string;
  name_fr: string;
  name_native: string | null;
  is_active: boolean;
};

// Rôles considérés comme "entreprise structurée" — à l'opposé de
// commercant/vendeur/freelance pour les règles de visibilité (posts.audience)
export const BUSINESS_ROLES: UserRole[] = [
  "fournisseur",
  "fabricant",
  "distributeur",
  "transporteur",
  "acheteur",
  "investisseur",
  "entreprise",
  "grossiste",
  "importateur",
  "commercial",
  "gestionnaire_entrepot",
  "representant_local",
  "prestataire_service",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  entreprise: "Entreprise",
  fournisseur: "Fournisseur",
  fabricant: "Fabricant",
  commercant: "Commerçant",
  vendeur: "Vendeur / Détaillant",
  distributeur: "Distributeur",
  acheteur: "Acheteur",
  transporteur: "Transporteur / Logistique",
  investisseur: "Investisseur / Partenaire",
  grossiste: "Grossiste",
  importateur: "Importateur",
  commercial: "Représentant commercial",
  gestionnaire_entrepot: "Gestionnaire d'entrepôt",
  representant_local: "Représentant local",
  freelance: "Freelance / Prestataire indépendant",
  prestataire_service: "Entreprise de services (design, nettoyage, relocation...)",
};
