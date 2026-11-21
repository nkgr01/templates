# Bibliothèque de templates — Sites vitrines premium

Douze templates multi-pages, optimisés pour le SEO, avec des composants 3D temps réel, en quatre collections
(GSAP ci-dessous, Motion / « façon Framer », Boutiques, Côte d'Ivoire), plus quatre dashboards.
Stack : **HTML + Tailwind CSS + JavaScript vanilla + GSAP/ScrollTrigger + Lenis + Three.js / WebGL**.

| Dossier | Type | Direction artistique | Composant 3D |
|---|---|---|---|
| `cabinet-halden/` | Cabinet (avocats, conseil, expertise) | Sombre, or, serif éditorial | Orbe d'or métallique PBR + poussière d'or (Three.js) |
| `saas-orbyt/` | SaaS / produit B2B | Néon, glassmorphism | Blob iridescent en shader GLSL (Three.js) + aurore en WebGL pur |
| `entreprise-norden/` | Entreprise (BTP, industrie, architecture) | Clair, style suisse | Ville isométrique en InstancedMesh, réactive à la souris |

`index.html` à la racine est la vitrine de la bibliothèque, à montrer aux clients.

## Lancer en local

La 3D est chargée en **module ES** (`<script type="module">`) : les navigateurs bloquent ces
modules quand on ouvre le fichier directement (`file://`). Il faut passer par un petit serveur :

- VS Code : extension **Live Server** → clic droit sur `index.html` → *Open with Live Server*
- ou en terminal : `npx serve .` dans ce dossier

## Structure d'un template

```
cabinet-halden/
├── index.html, cabinet.html, …   ← une page HTML par entrée du menu (SEO)
├── sitemap.xml, robots.txt
└── assets/
    ├── css/style.css             ← styles propres au template (en plus de Tailwind)
    └── js/
        ├── tw-config.js          ← couleurs et polices Tailwind (la charte du client)
        ├── main.js               ← moteur d'interactions commun (identique dans les 3)
        └── scene.js              ← scène Three.js du template
```

## Personnaliser pour un client

1. **Charte** : couleurs et polices dans `assets/js/tw-config.js`, plus les variables `:root` de `style.css`.
2. **Domaine** : remplacer l'URL fictive (`https://www.halden-avocats.fr`, etc.) dans tous les fichiers
   (balises `canonical`, `og:url`, JSON-LD, `sitemap.xml`, `robots.txt`). Un rechercher/remplacer suffit.
3. **SEO** : chaque page a son `<title>` et sa `<meta name="description">` dans le `<head>` → à réécrire
   avec les mots-clés du client. Mettre à jour le bloc JSON-LD (adresse, téléphone, horaires).
4. **Image de partage** : ajouter `assets/img/og-cover.jpg` (1200×630) pour LinkedIn, Facebook, etc.
5. **Formulaires** : ajouter un attribut `action` (ex. `action="https://formspree.io/f/xxxx"`) sur le
   `<form data-form>`. Sans `action`, l'envoi est seulement simulé pour la démo.
6. **Visuels** : les illustrations « architecture » de Norden et les monogrammes de l'équipe sont faits
   en CSS. Pour les remplacer par de vraies photos, utiliser `<img loading="lazy" alt="…">`.
7. **Pages juridiques** : chaque site a `mentions-legales.html` et `confidentialite.html`, liées depuis le
   pied de page et rédigées pour son secteur (barreau, Ordre des chirurgiens-dentistes et données de santé,
   loi Hoguet, garantie décennale, vente en ligne…). À faire pour chaque client :
   - remplacer les identifiants fictifs (RCS, SIRET et TVA en `000…`, capital, dirigeant) ;
   - compléter tout ce qui apparaît surligné entre crochets (`<mark class="todo">`) : assureur, médiateur
     de la consommation, numéros RPPS, carte professionnelle, hébergeur réel ;
   - vérifier le tableau des traitements (données, durées) au regard de ce que le client collecte vraiment ;
   - faire relire l'ensemble par un juriste : ces textes sont des modèles sérieux, pas un conseil juridique.

## Interactions disponibles (attributs `data-*`, gérés par main.js)

| Attribut | Effet |
|---|---|
| `data-split` | Titre animé mot par mot à l'apparition |
| `data-reveal` (+ `data-delay`) | Apparition en fondu et glissement |
| `data-stagger` | Apparition des enfants en cascade |
| `data-parallax="0.2"` | Parallaxe au scroll |
| `data-scale-in` | Bloc qui s'ouvre (clip-path) au scroll |
| `data-flatten` | Maquette qui se redresse en 3D au scroll |
| `data-hscroll` + `data-hscroll-track` | Section épinglée avec défilement horizontal (desktop) |
| `data-count="120"` | Compteur animé |
| `data-tilt="6"` | Carte qui s'incline en 3D au survol, avec halo |
| `data-magnetic=".3"` | Bouton magnétique |
| `data-tabs` + `role="tab"` | Onglets accessibles (navigation au clavier) |
| `data-filter-group` + `data-filter` | Filtres de portfolio |
| `data-billing-toggle` + `data-monthly` / `data-yearly` | Bascule des prix mensuels / annuels |
| `data-curtain` | Rideau de transition entre les pages |

Tout respecte `prefers-reduced-motion`. Les scènes 3D se mettent en pause hors écran.

---

# Collection 2 — Composants « façon Framer » (Motion)

| Dossier | Type | Direction artistique | Composant 3D |
|---|---|---|---|
| `agence-kinetik/` | Entreprise — agence créative | Sombre, typo Syne, lime électrique | Formes iridescentes (MeshPhysicalMaterial, iridescence) |
| `clinique-aelia/` | Cabinet — dentaire / santé | Clair, doux, serif italique | Cellule de 16 000 particules + hélice ADN (shader GLSL) |
| `immobilier-orea/` | Entreprise — immobilier de prestige | Éditorial crème et bronze, Fraunces | Villa procédurale avec mode Jour / Soir |

Différences avec la collection 1 :

- Les animations utilisent **[Motion](https://motion.dev)** (le moteur de Framer Motion, version JavaScript
  vanilla, chargé depuis jsDelivr) au lieu de GSAP. Ressorts physiques, animations de mise en page (FLIP),
  animations liées au scroll.
- Les **photos** sont stockées dans `assets/img/` (WebP, licence Unsplash : usage commercial autorisé,
  sans attribution obligatoire). Remplacez-les par celles du client en gardant les mêmes noms de fichiers.
- Le moteur commun s'appelle `assets/js/motion-ui.js` + `assets/css/motion-ui.css` (identiques dans les 3).
  Les couleurs des composants viennent des variables `--mo-*` du `style.css` de chaque site.

### Composants disponibles (attributs `data-*`, gérés par motion-ui.js)

| Attribut | Effet |
|---|---|
| `data-blur-text` | Titre qui apparaît mot par mot en se défloutant |
| `data-rotate-words="mot1\|mot2"` | Mots qui défilent dans un titre |
| `data-appear` (+ `data-delay`, `data-y`) | Apparition fondu + glissement + flou |
| `data-stagger` | Enfants qui apparaissent en cascade (ressort) |
| `data-nav-pill` | Navigation : pastille qui glisse sous le lien survolé |
| `data-ticker="30"` (+ `data-ticker-hover`) | Bandeau infini (ralentit au survol) |
| `data-counter="120"` (+ `data-decimals`) | Compteur animé |
| `data-parallax=".1"` / `data-zoom-scroll="1.2"` | Parallaxe / dézoom liés au scroll |
| `data-clip-scroll` | Image qui s'ouvre (clip-path arrondi) pendant le scroll |
| `data-stack` + `data-stack-card` | Cartes empilées (sticky) qui reculent |
| `data-hscroll` + `data-hscroll-track` | Défilement horizontal lié au scroll (desktop) |
| `data-carousel` + `data-carousel-track` | Carrousel à glisser (inertie + ressort), flèches et points |
| `data-tabs` + `data-tab-indicator` | Onglets avec indicateur glissant |
| `data-accordion` + `data-acc-item` | Accordéon à hauteur animée |
| `data-filter-group` + `data-filter` + `data-cat` | Filtres avec réorganisation animée (FLIP) |
| `data-expand` + `<template>` + `data-modal` | Carte qui s'agrandit en fenêtre (élément partagé) |
| `data-steps` + `data-step` | Formulaire en plusieurs étapes avec validation |
| `data-hover-reveal` + `data-reveal-img` | Aperçu d'image qui suit la souris sur une liste |
| `data-magnetic` / `data-tilt` / `data-spotlight` | Bouton magnétique / carte 3D / halo lumineux |
| `body[data-cursor]` + `data-cursor-label="Voir"` | Curseur personnalisé avec étiquette |
| `input[type=range][data-output]` | Curseur avec valeur affichée en direct |
| `data-page` | Transition fondu + flou entre les pages |

Sans Motion (CDN bloqué) ou avec « réduire les animations », tout le contenu reste visible et utilisable.

---

# Collection 3 — Boutiques (vêtements, accessoires, concept-store)

| Dossier | Type | Direction artistique | Composant 3D |
|---|---|---|---|
| `mode-arlo/` | Boutique de vêtements | Écru et terracotta, titres condensés (Archivo) | Pan de tissu animé par le vent, 3 matières (shader GLSL) |
| `bijoux-selene/` | Bijoux & accessoires | Nuit profonde et or, Cormorant Garamond | Bague configurable : métal, pierre, taille (verre à réfraction) |
| `comptoir-mimosa/` | Concept-store déco / beauté / cadeaux | Jaune mimosa, formes rondes, Bricolage Grotesque | Céramiques flottantes cliquables (ouvrent la fiche produit) |

Mêmes composants Motion que la collection 2 (`motion-ui.js`), plus une brique e-commerce commune
`assets/js/shop.js` + `assets/css/shop.css` (identiques dans les 3) :

| Attribut | Effet |
|---|---|
| `data-product` (+ `data-id`, `data-name`, `data-price`, `data-img`) | Conteneur d'un produit (carte, fiche, atelier…) |
| `data-add` | Ajoute le produit au panier (vérifie les options obligatoires) |
| `data-quick` | Ajout rapide depuis la carte, ou ouverture de la fiche s'il faut choisir une taille |
| `fieldset[data-opt]` (+ `data-required`) | Option coloris / taille ; `[data-opt-label]` affiche le choix |
| `data-wish` | Favoris (cœur) |
| `data-cart`, `data-cart-open`, `data-cart-count` | Panier latéral, bouton d'ouverture, pastille de quantité |
| `body[data-free-shipping="80"]` | Seuil de livraison offerte (barre de progression dans le panier) |
| `data-config` + `data-base` (+ `data-extra` sur chaque choix) | Configurateur dont le prix suit les options |
| `data-box` + `data-box-item` | Composeur de coffret (nombre maximum, total, aperçu) |
| `page.html#id-produit` | Ouvre directement la fiche du produit |

**Important** : le panier est une démonstration. Il est gardé dans le navigateur du visiteur (`localStorage`)
et le bouton « Commander » n'encaisse rien. En production, branchez-le sur une vraie solution de paiement :
Shopify (Buy Button / Storefront API), Stripe Checkout, Snipcart ou WooCommerce. Les attributs `data-id`
et `data-price` sont là pour ça.

Les fiches produit sont écrites dans le HTML (balise `<template>` de chaque carte) : elles sont lues par
Google, et les données structurées `Product` / `Offer` de chaque catalogue sont générées avec.

---

# Collection 4 — Côte d'Ivoire (restaurant, sport, hôtel)

| Dossier | Type | Direction artistique | Composant 3D |
|---|---|---|---|
| `restaurant-ebene/` | Restaurant gastronomique, Abidjan | Vert forêt, ocre, serif DM Serif, grain argentique | Bol fumant (vapeur en particules, épices en orbite) |
| `fitness-pulse/` | Salle de sport, Abidjan | Noir et rouge électrique, Barlow Condensed italique, coupes en biais | Kettlebell et anneaux qui battent comme un cœur (BPM affiché) |
| `hotel-lagune/` | Hôtel lodge, Assinie | Sable et turquoise, Marcellus, verre dépoli | Lagune animée (vagues, reflets du soleil), aube / midi / coucher |

Mêmes composants Motion que les collections 2 et 3, plus un petit `assets/js/site.js` propre à chaque site :

- **Pulse** : bascule mensuel / annuel (`data-billing`, `data-monthly`), réservation de créneaux avec places
  restantes (`data-slot`, `data-book`, `data-spots`), calculateur d'IMC (`data-bmi`).
- **Lagune** : formulaire de séjour `data-stay` : nuits, hébergement, options, total et acompte (30 %)
  calculés en direct. Il est pré-rempli depuis la barre de réservation de l'accueil (`?arrivee=…&depart=…`).

Contenus adaptés au marché ivoirien : prix en francs CFA (`priceCurrency: XOF` dans les données
structurées), numéros +225, réservation WhatsApp, paiement mobile money (Orange Money, MTN MoMo, Moov, Wave).
Les pages juridiques suivent le droit ivoirien : loi n° 2013-450 sur les données personnelles, ARTCI,
RCCM et NCC, loi n° 2013-546 sur les transactions électroniques. Elles sont à faire valider comme les autres.

---

# Dashboards

| Dossier | Type | Direction artistique |
|---|---|---|
| `dashboard-verdi/` | Application — gestion financière | Clair, vert / jaune / orange rayés, police Geist |

Reproduit la maquette Dribbble « Finance Management Web Dashboard » (Shakuro), traduite en français.
Marque, logos et noms remplacés par des éléments fictifs. Avant de revendre ce template, s'écarter
davantage de la maquette (couleurs, disposition), car le design original appartient à Shakuro.

- **Sans dépendance** : HTML + CSS + `assets/js/app.js`. Graphiques faits main (barres empilées, courbes SVG,
  jauge segmentée), aucune librairie de graphiques.
- **Données** : tout est dans l'objet `DATA` en haut de `app.js`. Remplacez-le par les réponses de votre API
  en gardant la même forme.
- **Interactions** : période 7 j / 30 j / 12 m, bascule barres / courbes, info-bulle au survol et au clavier,
  carrousel de cartes, envoi d'argent (met à jour le solde, le plafond et l'historique), plafond modifiable,
  ajout d'objectif, recherche (Ctrl K), tri et filtre des transactions, menu repliable, menu mobile.
- `noindex` : un dashboard n'a pas vocation à être indexé par Google.

## Dashboards métier (Côte d'Ivoire, FCFA)

| Dossier | Type | Direction artistique | Écrans |
|---|---|---|---|
| `dashboard-kora/` | Back-office e-commerce | Sombre, lime électrique, police Sora | Aperçu, Commandes, Produits, Clients |
| `dashboard-baobab/` | Caisse et gestion commerciale d'une supérette | Crème, terracotta, encre, police Plus Jakarta Sans | Caisse, Ventes, Stock, Ardoises |
| `dashboard-atlas/` | Gestion d'entreprise (PME de services) | Marine profond, cobalt, ambre, police Manrope | Tableau de bord, Factures, Projets, Équipe |

Points communs :

- **Sans dépendance** : HTML + CSS + `assets/js/app.js`, plus `assets/js/charts.js`, une mini-librairie
  faite main (courbes, barres groupées ou empilées, anneaux, mini-courbes, compteurs animés) identique dans
  les trois dossiers.
- **Données de démonstration** générées en haut de `app.js` avec un générateur pseudo-aléatoire stable
  (les chiffres sont toujours les mêmes, datés par rapport au jour d'ouverture). Pour un vrai client,
  remplacez ces tableaux par les réponses de son serveur, en gardant la même forme.
- **Navigation par écrans** avec adresse propre (`#commandes`, `#stock`…), bouton retour du navigateur,
  fenêtres accessibles (Échap, focus piégé), version mobile (menu latéral, barre d'onglets en bas,
  ticket de caisse en panneau).
- **Contexte local** : FCFA, Wave / Orange Money / MTN MoMo, communes d'Abidjan, TVA 18 %, CNPS.

Ce que chaque dashboard sait faire :

- **Kora** : période 7 j / 30 j / 12 mois comparée à la précédente, objectif du mois, parcours d'achat,
  commandes filtrables, triables et exportables (fichier CSV pour Excel), fiche commande avec suivi et
  changement de statut, recherche globale (touche `/`), ajustement du stock et mise hors ligne d'un produit,
  ajout de produit, segments clients (VIP, fidèles, à relancer…).
- **Baobab** : caisse (tuiles par rayon, recherche ou code + Entrée, touche `F2`), remise, monnaie à rendre,
  vente à crédit sur l'ardoise d'un client, ticket imprimable au format 80 mm, journal du jour, clôture de
  caisse avec écart, stock avec couverture en jours, entrée de stock, bon de commande regroupé par fournisseur,
  remboursement d'ardoise.
- **Atlas** : trésorerie réelle et prévision sur 3 mois (prudent / central / optimiste), échéances
  (salaires, CNPS, TVA, prêt, règlements attendus), balance âgée des factures, création de facture avec
  aperçu en direct, encaissement et relance, kanban glisser-déposer (ou flèches au clavier), équipe,
  présences, validation des congés.

## Production

- **Tailwind** : le CDN (`cdn.tailwindcss.com`) est parfait pour prototyper et faire des démos, mais en
  production il vaut mieux compiler un CSS minifié :
  `npx tailwindcss@3 -i input.css -o assets/css/tailwind.css --minify --content "./*.html"`
  (après avoir repris la config de `tw-config.js` dans un `tailwind.config.js`).
- Les librairies (GSAP, Lenis, Motion, Three.js) sont chargées depuis des CDN avec des versions figées.
