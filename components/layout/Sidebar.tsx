"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import type { UserRole } from "@/lib/types";

type NavItem = { href: string; label: string; icon: string };

const BASE_NAV: NavItem[] = [
  { href: "/feed", label: "Feed", icon: "📰" },
  { href: "/map", label: "Africa Business Map", icon: "🌍" },
  { href: "/partners", label: "Find a Partner", icon: "🤝" },
  { href: "/messages", label: "Messagerie", icon: "💬" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/stats", label: "Statistiques", icon: "📊" },
  { href: "/profile", label: "Mon profil", icon: "👤" },
];

// Modules additionnels selon le rôle — en dur pour l'instant (voir décision
// précédente : la table dashboard_modules attendra d'avoir une vraie
// équipe/besoin d'administration sans toucher au code).
const ROLE_NAV: Partial<Record<UserRole, NavItem[]>> = {
  transporteur: [{ href: "/logistics", label: "Logistics Match", icon: "🚚" }],
  fournisseur: [{ href: "/logistics", label: "Logistics Match", icon: "🚚" }],
  fabricant: [{ href: "/logistics", label: "Logistics Match", icon: "🚚" }],
  distributeur: [{ href: "/logistics", label: "Logistics Match", icon: "🚚" }],
  grossiste: [{ href: "/logistics", label: "Logistics Match", icon: "🚚" }],
  importateur: [{ href: "/logistics", label: "Logistics Match", icon: "🚚" }],
  // Les offres d'emploi/freelance sont des publications du feed classique
  // (voir NewPostForm), pas une page séparée — on y renvoie directement.
  freelance: [{ href: "/feed", label: "Offres d'emploi", icon: "💼" }],
  prestataire_service: [{ href: "/services", label: "Mes services", icon: "🛠️" }],
};

const PRODUCT_ROLES: UserRole[] = ["fournisseur", "fabricant", "distributeur", "grossiste", "importateur"];

export function Sidebar({ fullName, role, isAdmin }: { fullName: string; role: UserRole | null; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const roleNav = role ? ROLE_NAV[role] ?? [] : [];
  const showProducts = role && PRODUCT_ROLES.includes(role);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-line flex flex-col">
      <div className="px-5 py-5 border-b border-line">
        <span className="font-display text-lg text-indigo">OverLine</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {BASE_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {showProducts && (
          <NavLink
            item={{ href: "/products", label: "Mes produits", icon: "📦" }}
            active={pathname === "/products"}
          />
        )}

        {roleNav.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {isAdmin && (
          <>
            <p className="font-sans text-xs text-ink/40 uppercase tracking-wide px-3 pt-4 pb-1">Admin</p>
            <NavLink item={{ href: "/admin/verifications", label: "Vérifications", icon: "🛡️" }} active={pathname === "/admin/verifications"} />
            <NavLink item={{ href: "/admin/stats", label: "Statistiques globales", icon: "📈" }} active={pathname === "/admin/stats"} />
          </>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-line">
        <p className="font-sans text-sm font-medium text-ink truncate">{fullName}</p>
        <button
          onClick={handleLogout}
          className="font-sans text-xs text-ink/50 hover:text-clay mt-1"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-md font-sans text-sm transition-colors",
        active ? "bg-indigo/10 text-indigo font-medium" : "text-ink/70 hover:bg-stone-dim"
      )}
    >
      <span>{item.icon}</span>
      {item.label}
    </Link>
  );
}
