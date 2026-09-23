import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes accessibles sans session (ou pendant un onboarding incomplet)
const PUBLIC_PATHS = ["/", "/login", "/register", "/transparence"];
const ONBOARDING_PATHS = ["/confirm-email", "/recovery-key", "/qui-etes-vous", "/verification"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|css|js)$/)
  );
}

function isPublicCompanyPage(pathname: string) {
  return pathname.startsWith("/entreprise/") || pathname.startsWith("/profil/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname) || isPublicCompanyPage(pathname)) {
    return NextResponse.next();
  }

  const { supabaseResponse, supabase, user } = await updateSession(request);

  // Pas connecté → seules les pages publiques sont accessibles
  if (!user) {
    if (PUBLIC_PATHS.includes(pathname) || pathname === "/recovery-key") {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Connecté mais sur une page publique de type login/register → direction dashboard
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Email non confirmé → uniquement l'écran de confirmation est autorisé
  if (!user.email_confirmed_at) {
    if (pathname !== "/confirm-email" && pathname !== "/recovery-key") {
      return NextResponse.redirect(new URL("/confirm-email", request.url));
    }
    return supabaseResponse;
  }

  // Email confirmé : on lit l'étape d'onboarding réelle en base
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", user.id)
    .single();

  const step = profile?.onboarding_step ?? "qui_etes_vous";

  if (step === "qui_etes_vous" && pathname !== "/qui-etes-vous") {
    return NextResponse.redirect(new URL("/qui-etes-vous", request.url));
  }

  // verification_pending et complete ont tous deux accès au dashboard —
  // la vérification n'est bloquante que pour publier/contacter (géré dans
  // les routes concernées, pas ici), pas pour consulter le feed.
  if (step !== "qui_etes_vous" && ONBOARDING_PATHS.includes(pathname) && pathname !== "/verification") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
