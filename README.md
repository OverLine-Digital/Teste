<div align="center">

# 🌍 OverLine Africa Hub

### La plateforme B2B qui connecte réellement le commerce africain

*Pas un annuaire. Pas une simple marketplace. Un réseau de confiance qui assemble automatiquement fournisseurs, transporteurs, entrepôts, distributeurs et acheteurs — à travers 8+ pays et 29 langues.*

[![Statut](https://img.shields.io/badge/statut-en%20développement-C08A28)]()
[![Licence](https://img.shields.io/badge/licence-propriétaire-2B3A67)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Supabase-1E6F5C)]()

[Découvrir le projet](#-pourquoi-overline) · [Fonctionnalités](#-ce-qui-rend-overline-différent) · [Démarrage rapide](#-démarrage-rapide) · [Feuille de route](#-feuille-de-route)

</div>

---

## 🎯 Pourquoi OverLine

Le commerce inter-africain se heurte à trois murs : **la confiance** (qui est fiable ?), **la logistique** (comment ça arrive ?) et **la langue** (comment on se comprend ?).

Les marketplaces existantes résolvent le premier problème pour la Chine. Aucune ne résout les trois à la fois pour l'Afrique.

OverLine Africa Hub le fait en assemblant automatiquement une chaîne commerciale complète — fournisseur, transporteur, entrepôt, douane, distributeur — à partir d'une seule demande en langage naturel.

> *« Je cherche à importer 10 tonnes de riz d'Angola vers le Congo. »*
> OverLine identifie le fournisseur, l'importateur, le transporteur disponible, le transitaire, l'entrepôt et les acheteurs potentiels — et présente tout comme une chaîne prête à activer.

---

## ✨ Ce qui rend OverLine différent

### 🚚 Logistics Match — la fin des trajets à vide
Un camion qui livre Luanda → Pointe-Noire repart généralement vide. OverLine détecte cette capacité disponible et la propose automatiquement à une entreprise qui a besoin du trajet retour. Le transporteur économise, l'acheteur paie moins cher, tout le monde gagne — y compris la plateforme.

### 🕸️ African Business Graph
OverLine n'enregistre pas des entreprises isolées : il cartographie **qui travaille avec qui**. Fournisseur → transporteur → entrepôt → distributeur → marché final. Plus la plateforme est utilisée, plus cette carte du commerce africain devient précise et utile.

### 🗣️ Language Bridge — 29 langues, pas juste une interface traduite
Un commerçant congolais écrit en français, son fournisseur angolais reçoit le message en portugais, et répond dans sa langue — tout en gardant intacts la quantité, le prix, l'incoterm et le délai. Français, portugais, anglais, arabe, lingala, kikongo, wolof, swahili, kriolu et 20 autres langues africaines.

### 🛡️ Un passeport commercial, pas un badge
Pas de simple "✅ Vérifié". OverLine affiche **ce qui a été vérifié et quand** : identité légale, activité, téléphone, adresse, responsable identifié, capacité commerciale, capacité d'exportation. Et une réputation basée sur des faits — transactions réalisées, litiges résolus, temps de réponse moyen — jamais des étoiles.

### 🏢 Au-delà du produit — Find a Business Partner
Une entreprise ne cherche pas toujours un produit. Parfois elle cherche un distributeur au Congo, un représentant commercial en Angola, ou un partenaire pour s'implanter au Cameroun. OverLine fait aussi cette mise en relation.

### 📸 Recherche par photo
Une photo suffit — l'IA la décrit et retrouve les produits correspondants dans le catalogue, sans avoir à connaître le bon mot-clé.

### 🔐 Confiance financière
Escrow (paiement séquestre), vérification terrain physique, mobile money, financement participatif investisseur-PME — la confiance ne repose pas sur la bonne foi, elle est construite structurellement.

---

## 🧱 Stack technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Base de données, auth, storage | Supabase (PostgreSQL) |
| Recherche par similarité | pgvector |
| Appels vocaux/vidéo | LiveKit |
| Vision & description d'image | DeepSeek Vision |
| Style | Tailwind CSS |
| Hébergement | Cloudflare Pages |

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- Un compte [Supabase](https://supabase.com) (le projet existe déjà si tu rejoins l'équipe — demande l'accès)

### Installation

```bash
git clone https://github.com/OverLine-Digital/overline-africa-hub.git
cd overline-africa-hub
npm install
```

### Variables d'environnement

Copie le fichier d'exemple et renseigne tes propres clés :

```bash
cp .env.local.example .env.local
```

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | [livekit.cloud](https://livekit.cloud) → ton projet |

### Lancer le projet en local

```bash
npm run dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 📁 Structure du projet

```
overline-africa-hub/
├── app/
│   ├── (auth)/          # Inscription, connexion, clé de récupération
│   ├── (onboarding)/    # "Qui êtes-vous ?" + vérification
│   ├── (dashboard)/     # Feed, profil, capacités, messagerie
│   └── api/
├── components/
│   ├── ui/              # Composants réutilisables
│   ├── feed/
│   └── layout/
├── lib/
│   └── supabase/        # Clients Supabase (navigateur + serveur)
└── middleware.ts        # Contrôle d'accès selon l'étape d'onboarding
```

La base de données (schéma complet : profils, entreprises, capacités, matching logistique, vérifications, réputation, traductions) vit directement dans Supabase — voir le dashboard du projet pour l'explorer.

---

## 🗺️ Feuille de route

- [x] Schéma de base de données complet (22 tables)
- [x] Flux d'inscription et de vérification
- [ ] Feed et messagerie
- [ ] Business Match + Logistics Match
- [ ] Africa Business Map
- [ ] Escrow et paiement mobile money
- [ ] Appels vocaux/vidéo (LiveKit)
- [ ] Language Bridge (traduction temps réel)
- [ ] Recherche par photo

---

## 🤝 Contribuer

Ce projet est actuellement développé en interne. Pour toute question, contacte l'équipe OverLine Digital.

---

<div align="center">

**OverLine Africa Hub** — Connecter le commerce africain, un corridor à la fois.

</div>
