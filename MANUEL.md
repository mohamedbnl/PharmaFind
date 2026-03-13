# MANUEL — PharmaFind / دليل المستخدم — فارمافايند

> **Version 1.0 — Pilot: Tanger / طنجة**
> Support: support@pharmafind.ma

---

## Table des matières / فهرس المحتويات

1. [Introduction](#1-introduction)
2. [Guide citoyen](#2-guide-citoyen--دليل-المواطن)
3. [Guide pharmacien](#3-guide-pharmacien--دليل-الصيدلاني)
4. [Référence — Statuts de stock](#4-référence--statuts-de-stock)
5. [Référence — Indicateur de fraîcheur](#5-référence--indicateur-de-fraîcheur)
6. [Référence technique](#6-référence-technique)

---

## 1. Introduction

**PharmaFind** est une plateforme de santé numérique permettant aux citoyens du Maroc de localiser rapidement un médicament disponible dans une pharmacie proche.
**فارمافايند** منصة صحية رقمية تُمكّن مواطني المغرب من إيجاد الأدوية المتوفرة في الصيدليات القريبة بسرعة.

| | |
|---|---|
| **Langue par défaut** | Français (bascule vers Arabe en haut de page) |
| **اللغة الافتراضية** | الفرنسية (يمكن التبديل للعربية من أعلى الصفحة) |
| **Ville pilote** | Tanger / طنجة — 158 pharmacies, 2 839 médicaments |
| **Accès citoyen** | Sans inscription — recherche directe |
| **Accès pharmacien** | Inscription requise — numéro CNOP obligatoire |

---

## 2. Guide citoyen / دليل المواطن

### 2.1 Rechercher un médicament / البحث عن دواء

1. Allez sur **PharmaFind.ma** (ou ouvrez l'application).
2. Dans la barre de recherche, tapez le **nom du médicament** (ex. : `Doliprane`, `Augmentin`, `Amoxicilline`).
3. Une liste de suggestions apparaît dès 2 caractères saisis — incluant le nom commercial, le DCI (générique) et la forme galénique.
4. Sélectionnez le médicament souhaité et appuyez sur **Rechercher**.

> **Astuce :** La recherche fonctionne en français ET en arabe, et tolère les fautes de frappe grâce à la recherche floue.

---

1. افتح **PharmaFind.ma**
2. اكتب **اسم الدواء** في شريط البحث (مثلاً: `Doliprane`، `Augmentin`)
3. تظهر اقتراحات بعد كتابة حرفين — تشمل الاسم التجاري، الاسم العلمي (DCI)، والشكل الصيدلاني
4. اختر الدواء المطلوب واضغط **بحث**

---

### 2.2 Autoriser la géolocalisation / السماح بالموقع الجغرافي

- Si vous **autorisez** la géolocalisation, les résultats sont triés par distance depuis votre position.
- Si vous **refusez**, un sélecteur de ville apparaît pour filtrer les pharmacies par zone.

---

### 2.3 Lire les résultats / قراءة النتائج

Chaque carte de pharmacie affiche :

| Élément | Description |
|---------|-------------|
| **Nom de la pharmacie** | En français et en arabe |
| **Distance** | En kilomètres depuis votre position |
| **Badge de stock** | Statut du médicament (voir §4) |
| **Indicateur de fraîcheur** | Quand les données ont été confirmées en dernier (voir §5) |
| **Ouvert / Fermé** | Calculé en temps réel (fuseau horaire Maroc) |
| **Bouton WhatsApp** | Contact direct avec la pharmacie |

Les résultats sont triés par **distance** (par défaut). Les pharmacies avec des données récentes sont prioritaires sur celles avec des données périmées.

---

### 2.4 Page de détail d'une pharmacie / صفحة تفاصيل الصيدلية

Cliquez sur une pharmacie pour voir :
- **Liste complète du stock** avec statut de chaque médicament
- **Horaires d'ouverture** par jour de la semaine
- **Adresse complète** et lien **Itinéraire** (Google Maps / Waze)
- **Bouton WhatsApp** pour appeler ou envoyer un message
- **Widget de retour** — confirmez ou signalez une information incorrecte

---

### 2.5 Pharmacies de garde / صيدليات المناوبة

Pour trouver la pharmacie de garde (nuit / urgences) :

1. Cliquez sur **Pharmacie de garde** depuis la page d'accueil (ou `/fr/on-duty`).
2. Autorisez votre position ou sélectionnez une ville.
3. La liste des pharmacies de garde **en ce moment** s'affiche avec leur distance.

> Les pharmacies de garde sont prioritaires affiché entre **20h00 et 08h00**.

---

### 2.6 Signaler une inexactitude / الإبلاغ عن معلومة غير صحيحة

Sur la page d'une pharmacie :
1. Cliquez **👍** si le stock correspond à la réalité.
2. Cliquez **👎** si le stock est incorrect, puis ajoutez un commentaire optionnel.
3. Votre retour est transmis à la pharmacie et améliore la fiabilité des données.

---

### 2.7 Alerte de disponibilité / تنبيه التوفر

Si un médicament est introuvable :
1. Cliquez **M'alerter** dans la page de résultats vides.
2. Choisissez **Email** ou **Téléphone**.
3. Vous recevrez une notification dès qu'une pharmacie de Tanger met à jour ce médicament en stock.
4. L'alerte expire automatiquement après **7 jours**.

---

## 3. Guide pharmacien / دليل الصيدلاني

### 3.1 Créer un compte / إنشاء حساب

1. Allez sur **PharmaFind.ma** → **Inscrire ma pharmacie**.
2. Renseignez :
   - Nom complet
   - Email professionnel
   - Téléphone (+212XXXXXXXXX)
   - **Numéro de licence CNOP** (obligatoire)
   - Mot de passe (minimum 8 caractères)
3. Cliquez **Créer mon compte**.

---

### 3.2 Configurer votre pharmacie / إعداد ملف الصيدلية

Après connexion, l'assistant d'intégration (3 étapes) vous guide :

**Étape 1 — Informations de base**
- Nom de la pharmacie en français et en arabe
- Adresse complète
- Positionnez le marqueur GPS sur la carte
- Téléphone, WhatsApp (optionnel), email

**Étape 2 — Horaires d'ouverture**
- Cochez les jours d'ouverture
- Renseignez les heures d'ouverture et de fermeture
- Possibilité d'ajouter une pause déjeuner (ouverture2 / fermeture2)
- Cochez **Ouvert 24h/24** si applicable

**Étape 3 — Confirmation**
- Vérifiez les informations et cliquez **Créer la pharmacie**
- Votre fiche est immédiatement visible dans les recherches

> **Objectif :** Inscription complète en moins de 5 minutes.

---

### 3.3 Tableau de bord / لوحة التحكم

Après connexion → **Dashboard** (`/fr/dashboard`) :

| Carte | Description |
|-------|-------------|
| **Recherches (7 jours)** | Combien de fois votre pharmacie est apparue dans les résultats |
| **Médicaments en stock** | Nombre total d'entrées dans votre inventaire |
| **Mises à jour en attente** | Médicaments dont les données dépassent 24h sans confirmation |

---

### 3.4 Gérer le stock / إدارة المخزون

Accès : **Dashboard → Gérer le stock** (`/fr/dashboard/stock`)

#### Ajouter un médicament
1. Dans la barre de recherche en haut, tapez le nom du médicament.
2. Sélectionnez-le dans la liste (recherche dans les 2 839 médicaments du catalogue).
3. Cliquez **Ajouter** — il apparaît dans votre tableau avec le statut `Disponible` par défaut.

#### Mettre à jour le statut (médicament individuel)
Utilisez les 4 boutons rapides dans la ligne du médicament :

| Bouton | Action |
|--------|--------|
| **✓** | Marquer comme Disponible |
| **⚠** | Marquer comme Stock faible |
| **✗** | Marquer comme Indisponible |
| **↑** | Marquer comme Sur commande |

#### Mise à jour groupée
1. Cochez les cases à gauche de plusieurs médicaments.
2. Une barre d'actions apparaît en haut du tableau.
3. Sélectionnez le statut à appliquer → **Mettre à jour**.

#### Confirmer tout
- Cliquez **Confirmer tout** pour rafraîchir le timestamp `last_confirmed_at` de tous vos médicaments.
- Faites-le **au moins une fois par jour**, idéalement à l'ouverture.
- Cela maintient vos données en vert (< 6h) pour les citoyens.

#### Supprimer un médicament
Cliquez l'icône de suppression en fin de ligne pour retirer un médicament de votre liste.

---

### 3.5 Gérer votre profil / إدارة ملفك الشخصي

Accès : **Dashboard → Profil** (`/fr/dashboard/profile`)

- Modifier : nom, adresse, ville, région
- Mettre à jour les horaires d'ouverture
- Changer le numéro WhatsApp
- Ajouter/modifier l'URL de la photo

---

### 3.6 Analytiques / التحليلات

Accès : **Dashboard → Analytiques** (`/fr/dashboard/analytics`)

| Métrique | Description |
|----------|-------------|
| **Impressions (7 jours)** | Apparitions dans les résultats de recherche |
| **Total** | Impressions depuis la création du compte |
| **Médicaments en stock** | Inventaire actif |
| **Médicaments les plus recherchés** | Top requêtes dans votre zone géographique |

---

## 4. Référence — Statuts de stock

| Statut | Libellé FR | Libellé AR | Couleur | Signification |
|--------|-----------|-----------|---------|---------------|
| `AVAILABLE` | Disponible | متوفر | Vert | En stock, peut être dispensé immédiatement |
| `LOW_STOCK` | Stock faible | مخزون منخفض | Jaune | Peu de stock restant — risque de rupture prochaine |
| `OUT_OF_STOCK` | Indisponible | غير متوفر | Rouge | Rupture de stock |
| `ARRIVING_SOON` | Sur commande | قيد الطلب | Bleu | Commandé, attendu sous 48h maximum |

---

## 5. Référence — Indicateur de fraîcheur

L'indicateur de fraîcheur reflète **quand la pharmacie a confirmé en dernier** l'exactitude de ses données.

| Couleur | Délai | Libellé FR | Libellé AR | Signification |
|---------|-------|-----------|-----------|---------------|
| Vert | < 6 heures | Vérifié | مؤكد | Données très fiables |
| Jaune | 6–24 heures | Récent | حديث | Données probablement exactes |
| Orange | 24–72 heures | Peut-être obsolète | قد يكون قديماً | À vérifier — stock peut avoir changé |
| Rouge | > 72 heures | Non vérifié | غير مؤكد | Données périmées — appeler avant de se déplacer |

> **Conseil citoyen :** Préférez les pharmacies avec un indicateur vert ou jaune pour éviter un déplacement inutile.

> **Conseil pharmacien :** Cliquez **Confirmer tout** chaque matin pour rester en vert.

---

## 6. Référence technique

### 6.1 API

| Élément | Valeur |
|---------|--------|
| Base URL (local) | `http://localhost:3001/api/v1` |
| Health check | `GET /health` → `{ "status": "ok" }` |
| Documentation endpoints | Voir `CLAUDE.md §3.3` |

### 6.2 Lancer l'application en local

```bash
# 1. Variables d'environnement
cp .env.example backend/.env
# Éditer backend/.env : DATABASE_URL, JWT_SECRET

# 2. Base de données
cd backend
npx prisma migrate deploy
npx ts-node prisma/seed.ts
# → 2 839 médicaments, 158 pharmacies, 19 140 entrées de stock

# 3. Backend
npm run dev          # port 3001

# 4. Frontend (autre terminal)
cd frontend
npm run dev          # port 3000

# 5. Accès
# http://localhost:3000/fr    (français)
# http://localhost:3000/ar    (arabe)
```

### 6.3 Tests

```bash
# Tests unitaires (freshness, etc.)
cd backend && npx jest

# Test de charge (serveur doit tourner)
npx ts-node tests/load/search-load.ts
# Objectif : latence avg < 200ms, p99 < 500ms, 0 erreurs
```

### 6.4 Variables d'environnement essentielles

Voir `.env.example` pour la liste complète.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_SECRET` | Clé secrète JWT (64+ caractères en production) |
| `FRONTEND_URL` | Domaine frontend exact (CORS) |
| `NODE_ENV` | `development` ou `production` |

### 6.5 Checklist de déploiement

Voir `LAUNCH_CHECKLIST.md` pour la checklist complète du lancement bêta (Tanger).

---

*PharmaFind v1.0 — Tanger Pilot — Contact: support@pharmafind.ma*
