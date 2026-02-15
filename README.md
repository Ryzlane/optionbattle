# OptionBattle ⚔️

Une application collaborative de prise de décision par comparaison d'options avec système de scoring temps réel.

## 🎯 Fonctionnalités

### Core Features
- **Création de Battles** : Créez des battles pour comparer différentes options (fighters)
- **Système de scoring intelligent** : Arguments pour/contre pondérés automatiquement
- **Champion automatique** : L'option gagnante est déterminée automatiquement
- **Templates prédéfinis** : Démarrage rapide avec des templates (Choix carrière, Destination voyage, etc.)

### Collaboration Temps Réel
- **Co-édition multi-utilisateurs** : Plusieurs personnes peuvent modifier une battle simultanément
- **WebSocket synchronisation** : Mise à jour instantanée pour tous les collaborateurs
- **3 niveaux de permissions** :
  - **Propriétaire** : Contrôle total + gestion des collaborateurs
  - **Éditeur** : Peut modifier fighters et arguments
  - **Lecteur** : Consultation uniquement
- **Partage par liens** : Générez des liens partageables avec permissions configurables
- **Invitation par email** : Invitez des collaborateurs directement
- **Indicateurs de présence** : Voyez qui est connecté en temps réel

### UX
- **Sons interactifs** : Feedback sonore sur les actions
- **Animations fluides** : Framer Motion
- **Interface moderne** : TailwindCSS + Radix UI
- **Responsive** : Fonctionne sur mobile, tablette et desktop

## 🛠️ Stack Technique

### Backend
- **Runtime** : Node.js + Bun
- **Framework** : Express.js
- **WebSocket** : Socket.io (collaboration temps réel)
- **ORM** : Prisma
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **Authentification** : JWT
- **Validation** : express-validator
- **Sécurité** : Helmet, rate limiting

### Frontend
- **Framework** : React 19
- **Build tool** : Vite
- **Routing** : React Router v6
- **État** : Context API
- **Styling** : TailwindCSS
- **UI Components** : Radix UI
- **Animations** : Framer Motion
- **Notifications** : Sonner
- **WebSocket** : Socket.io-client
- **Date** : date-fns

## 📦 Installation

### Prérequis
- Node.js 18+
- Bun (recommandé) ou npm/yarn

### Backend

```bash
cd backend
bun install
bunx prisma migrate dev
bun run dev
```

Le serveur démarre sur `http://localhost:5001`

### Frontend

```bash
cd frontend
bun install
bun run dev
```

L'application démarre sur `http://localhost:5173`

## 🔧 Configuration

### Backend `.env`
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
DATABASE_URL="file:./prisma/dev.db"
```

### Frontend `.env.local`
```env
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_SOUNDS=true
```

## 📊 Modèle de Données

### Battle
- Titre, description, statut (draft/active/completed)
- Champion automatique (fighter avec le meilleur score)
- Propriétaire + collaborateurs

### Fighter (Option)
- Nom, description
- Liste d'arguments (powers/weaknesses)
- Score calculé automatiquement

### Argument
- Type : power (+1 à +5) ou weakness (-1 à -5)
- Poids : impact sur le score final
- Texte descriptif

### Collaboration
- Rôle : owner, editor, viewer
- Lien avec battle et utilisateur
- Date d'adhésion, dernière activité

### ShareLink
- Token unique
- Rôle par défaut
- Expiration optionnelle
- Compteur d'utilisation

## 🚀 Utilisation

1. **Créez un compte** ou connectez-vous
2. **Créez une Battle** depuis le dashboard
3. **Ajoutez des Fighters** (options à comparer)
4. **Ajoutez des Arguments** pour/contre chaque fighter
5. **Le champion** est automatiquement déterminé
6. **Partagez** avec des collaborateurs pour des décisions de groupe

## 🔐 Sécurité

- Authentification JWT
- Rate limiting (100 req/15min en dev, 5 req/15min auth en prod)
- Permissions granulaires (owner/editor/viewer)
- Validation des inputs
- Protection CORS
- Helmet.js pour headers sécurisés

## 🎨 Crédits

Développé avec ❤️ et Claude Code (Sonnet 4.5)

## 📝 License

MIT
