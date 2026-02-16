# ⚔️ OptionBattle - Guide pour Claude Code

Ce fichier contient les instructions et conventions pour travailler sur le projet OptionBattle.

## 🎯 Description du projet

**Baseline**: "Let your options fight it out. The best one always wins."

OptionBattle est une plateforme gamifiée d'aide à la décision qui transforme le processus décisionnel en une bataille épique entre options. Chaque option devient un "Fighter" avec des "Attack Powers" (arguments pro) et "Weaknesses" (arguments con). L'application calcule automatiquement un score de combat pour chaque fighter et déclare un vainqueur.

### État d'avancement : 98% ✅

**✅ Implémenté** :
- ✅ Backend Auth (JWT + bcrypt)
- ✅ Backend Battles CRUD complet avec scoring automatique
- ✅ Frontend Auth UI (Login + Register)
- ✅ Battle Arena (Dashboard avec filtres et stats)
- ✅ Battle Editor complet avec auto-save (debounce 3s)
- ✅ Système de badges (backend complet, 5 badges)
- ✅ Calcul temps réel des scores et champion
- ✅ Power Level slider (1-5)
- ✅ Design battle-themed cohérent
- ✅ **Collaboration temps réel (WebSocket + Socket.io)**
- ✅ **Système de permissions (owner/editor/viewer)**
- ✅ **Partage par email et liens partageables**
- ✅ **Synchronisation multi-utilisateurs instantanée**
- ✅ **Indicateurs de présence en ligne**
- ✅ **Arènes collaboratives (Workspaces multi-utilisateurs)**
- ✅ **Sidebar navigation avec arènes**
- ✅ **Permissions au niveau arène avec cascade vers battles**
- ✅ **Rejoindre arène sans compte (redirect après login/register)**

**📝 À venir (optionnel)** :
- Templates (Quick Battles pré-configurés)
- Sons avec toggle
- Export PDF

### Différences clés avec DecisionHub
- **Gamification** : badges avec débloquage automatique
- **Vocabulaire battle** : Decision→Battle, Options→Fighters, Arguments→Powers/Weaknesses
- **Auto-save** : sauvegarde automatique avec debounce (3s)
- **UX améliorée** : animations, slider pour Power Level, champion en temps réel

## 🏗️ Architecture

### Stack Technique
- **Backend**: Node.js + Express + Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Frontend**: React 19 + Vite + TailwindCSS + Radix UI
- **Authentification**: JWT avec bcrypt
- **Runtime**: Bun (compatible Node.js)
- **Temps réel**: Socket.io (WebSocket) pour collaboration
- **Gamification**: Framer Motion, react-confetti, Zustand
- **Sons**: Fichiers audio avec toggle (5 sons)
- **Export**: jsPDF + jspdf-autotable

### Structure des dossiers (implémentée)

```
optionbattle/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js ✅
│   │   │   ├── battle.controller.js ✅
│   │   │   ├── fighter.controller.js ✅
│   │   │   ├── argument.controller.js ✅
│   │   │   ├── badge.controller.js ✅
│   │   │   ├── collaboration.controller.js ✅
│   │   │   ├── arena.controller.js ✅
│   │   │   └── arenaCollaboration.controller.js ✅
│   │   ├── routes/
│   │   │   ├── auth.routes.js ✅
│   │   │   ├── battle.routes.js ✅
│   │   │   ├── fighter.routes.js ✅
│   │   │   ├── argument.routes.js ✅
│   │   │   ├── badge.routes.js ✅
│   │   │   ├── collaboration.routes.js ✅
│   │   │   ├── arena.routes.js ✅
│   │   │   └── arenaCollaboration.routes.js ✅
│   │   ├── middleware/
│   │   │   ├── auth.js ✅
│   │   │   ├── validation.js ✅
│   │   │   └── errorHandler.js ✅
│   │   ├── services/
│   │   │   └── badgeService.js ✅ (5 badges)
│   │   ├── socket/
│   │   │   └── index.js ✅ (WebSocket handlers)
│   │   ├── utils/
│   │   │   ├── jwt.js ✅
│   │   │   ├── password.js ✅
│   │   │   └── scoring.js ✅
│   │   └── server.js ✅
│   ├── prisma/
│   │   └── schema.prisma ✅ (User, Arena, ArenaCollaboration, ArenaShareLink, ArenaActivity, Battle, Fighter, Argument, Badge, Collaboration, ShareLink, Activity)
│   └── .env ✅
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx ✅
    │   │   │   └── RegisterPage.jsx ✅
    │   │   ├── DashboardPage.jsx ✅ (Arena Perso, battles personnelles)
    │   │   ├── BattlePage.jsx ✅
    │   │   ├── JoinBattlePage.jsx ✅
    │   │   ├── ArenaPage.jsx ✅ (Page arène avec battles)
    │   │   └── JoinArenaPage.jsx ✅ (Rejoindre arène via lien)
    │   ├── components/
    │   │   ├── ui/ (Button, Input, Label, Card, Dialog, Slider) ✅
    │   │   ├── auth/ ✅
    │   │   ├── battle/ (FighterCard, AddFighterDialog, AddArgumentDialog, ArgumentItem) ✅
    │   │   ├── arena/ (BattleCard, CreateBattleDialog, ArenaSettingsDialog, ArenaCollaboratorsList) ✅
    │   │   ├── gamification/ (BadgeItem, BadgeNotification) ✅
    │   │   ├── collaboration/ (ShareDialog, CollaboratorsList, OnlineIndicator) ✅
    │   │   └── shared/ (Layout, Sidebar, CreateArenaDialog) ✅
    │   ├── contexts/
    │   │   ├── AuthContext.jsx ✅
    │   │   ├── CollaborationContext.jsx ✅
    │   │   ├── ArenaContext.jsx ✅
    │   │   └── SoundContext.jsx ✅
    │   ├── hooks/
    │   │   ├── useAutoSave.js ✅
    │   │   ├── useBadges.js ✅
    │   │   └── useRealtimeBattle.js ✅
    │   ├── services/
    │   │   └── api.js ✅
    │   ├── utils/
    │   │   └── cn.js ✅
    │   ├── main.jsx ✅
    │   ├── App.jsx ✅
    │   └── index.css ✅
    ├── tailwind.config.js ✅
    ├── postcss.config.js ✅
    └── .env.local ✅
```

## 📊 Modèle de données

```
User (utilisateurs)
  ├── Arena (arènes/workspaces) - title, description, status
  │     ├── Battle (batailles) - title, description, status, championId, arenaId
  │     │     ├── Fighter (combattants) - name, description, score, order
  │     │     │     └── Argument (powers/weaknesses) - text, type (power/weakness), weight (1-5)
  │     │     ├── Collaboration (collaborateurs battle) - role, joinedAt, lastSeenAt
  │     │     ├── ShareLink (liens partageables battle) - token, role, expiresAt, usageCount
  │     │     └── Activity (historique battle) - action, entityType, entityId, metadata
  │     ├── ArenaCollaboration (collaborateurs arène) - role (owner/editor/viewer), joinedAt
  │     ├── ArenaShareLink (liens partageables arène) - token, role, expiresAt, usageCount
  │     └── ArenaActivity (historique arène) - action, entityType, entityId, metadata
  └── Badge (badges débloqués) - badgeType, unlockedAt

Template (Quick Battles pré-configurés)
  - name, description, category, fighters[], arguments[]
```

Relations :
- User 1:N Arena 1:N Battle 1:N Fighter 1:N Argument
- User 1:N Badge
- User N:M Arena (via ArenaCollaboration) - Permissions cascade vers battles
- User N:M Battle (via Collaboration) - Permissions au niveau battle
- Arena 1:N ArenaShareLink - Liens partageables arène
- Arena 1:N ArenaActivity - Log des actions arène
- Battle 1:N ShareLink - Liens partageables battle
- Battle 1:N Activity - Log des actions battle
- Battle N:1 Fighter (championId)
- Battle N:1 Arena (arenaId, nullable pour battles perso)

## 🎮 Vocabulaire OptionBattle

**IMPORTANT** : Toujours utiliser le vocabulaire battle, jamais le vocabulaire décision.

| DecisionHub | OptionBattle | Utilisation |
|-------------|--------------|-------------|
| Decision | **Battle** | "Create a new battle" |
| Option | **Fighter** | "Add a fighter to the arena" |
| Argument Pro | **Attack Power** | "This fighter's attack power is..." |
| Argument Con | **Weakness** | "This fighter's weakness is..." |
| Weight (1-5) | **Power Level** | "Set the power level" |
| Score | **Combat Score** | "Fighter combat score: +15" |
| Best option | **Champion** | "The champion is Fighter A!" |
| Dashboard | **Battle Arena** | "Welcome to the Battle Arena" |
| Create | **Launch a Battle** | "Launch your first battle" |
| Compare | **Let them fight** | "Let your fighters battle it out" |

## 🤝 Collaboration Temps Réel

### Architecture WebSocket

**Pattern Hybrid REST + WebSocket** :
- **REST API** : CRUD initial, permissions, invitations, liens
- **WebSocket (Socket.io)** : Synchronisation temps réel des modifications
- **Stratégie de conflit** : Last-Write-Wins (le dernier update gagne)

### Système de Permissions

| Rôle | Lecture | Édition | Supprimer battle | Inviter | Partager |
|------|---------|---------|------------------|---------|----------|
| **owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **editor** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |

### Routes Collaboration

**REST API** :
- `GET /api/collaboration/:battleId/collaborators` - Liste des collaborateurs
- `POST /api/collaboration/:battleId/collaborators` - Inviter par email
- `DELETE /api/collaboration/:battleId/collaborators/:userId` - Retirer collaborateur
- `POST /api/collaboration/:battleId/share-links` - Créer lien partageable
- `GET /api/collaboration/:battleId/share-links` - Liste des liens
- `DELETE /api/collaboration/:battleId/share-links/:linkId` - Supprimer lien
- `POST /api/collaboration/join/:token` - Rejoindre via lien (public)
- `GET /api/collaboration/:battleId/activities` - Historique activités

**WebSocket Events** :
- `battle:join` - Rejoindre une battle room
- `battle:leave` - Quitter une battle room
- `battle:update` - Modifier battle (titre, description)
- `fighter:add` / `fighter:update` / `fighter:delete` - Fighters
- `argument:add` / `argument:update` / `argument:delete` - Arguments
- `user:joined` / `user:left` - Événements de présence
- `collaborator:added` / `collaborator:removed` - Gestion collaborateurs

### Fonctionnalités

1. **Invitation par email** : Inviter un utilisateur existant en saisissant son email
2. **Liens partageables** : Générer un lien unique avec rôle (editor/viewer)
3. **Synchronisation temps réel** : Toutes modifications visibles instantanément
4. **Indicateurs de présence** : Voir qui est connecté en temps réel
5. **Notifications** : Toasts informant des actions des collaborateurs
6. **Historique d'activité** : Log de toutes les actions (Activity model)

### Implémentation Frontend

**CollaborationContext** :
```javascript
import { useCollaboration } from './contexts/CollaborationContext';

const { socket, isConnected, activeBattle, onlineUsers, joinBattle, emit, on } = useCollaboration();
```

**useRealtimeBattle Hook** :
```javascript
import { useRealtimeBattle } from './hooks/useRealtimeBattle';

const { battle, setBattle } = useRealtimeBattle(battleId, initialBattle);
// Synchronisation automatique via WebSocket
```

**Composants** :
- `<ShareDialog />` - Interface partage (email + liens)
- `<CollaboratorsList />` - Liste collaborateurs avec gestion
- `<OnlineIndicator />` - Status connexion + avatars online

### Sécurité Collaboration

- Vérification permissions côté serveur dans chaque event WebSocket
- Tokens JWT dans handshake Socket.io
- Validation rôle avant chaque action critique
- Rate limiting sur endpoints d'invitation
- Expiration optionnelle des liens partageables

## 🏟️ Arènes Collaboratives (Workspaces)

### Concept

Les **Arènes** sont des workspaces collaboratifs qui regroupent plusieurs battles. C'est une couche supérieure à la collaboration au niveau battle, permettant d'organiser des battles par équipes, projets ou familles.

**Hiérarchie** :
```
User
├── Arena Perso (battles personnelles, arenaId = null)
└── Arènes collaboratives
    ├── Arena 1 (workspace partagé)
    │   ├── Battle A
    │   ├── Battle B
    │   └── Battle C
    └── Arena 2 (workspace partagé)
        └── Battle D
```

### Architecture Arènes

**Modèles Backend** :
- `Arena` - Workspace collaboratif (title, description, status)
- `ArenaCollaboration` - Permissions au niveau arène (role: owner/editor/viewer)
- `ArenaShareLink` - Liens partageables pour arènes
- `ArenaActivity` - Log des actions dans l'arène

**Relations** :
- User 1:N Arena (propriétaire)
- User N:M Arena (via ArenaCollaboration)
- Arena 1:N Battle (une arène contient plusieurs battles)
- Battle N:1 Arena (une battle peut appartenir à une arène)

### Système de Permissions Arène

**Cascade arène → battles** :
- Les permissions d'arène s'appliquent automatiquement à toutes les battles de l'arène
- Un membre "editor" de l'arène peut modifier toutes ses battles
- Un membre "viewer" de l'arène ne peut que lire les battles

**Permissions arène** :

| Rôle | Lire battles | Créer battle | Modifier battles | Gérer arène | Inviter | Quitter |
|------|-------------|--------------|-----------------|-------------|---------|---------|
| **owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (supprimer) |
| **editor** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **viewer** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

**Note** : Tous les membres (même viewers) peuvent créer des battles dans l'arène pour encourager la participation démocratique.

### Routes Arènes

**Backend API** :
- `GET /api/arenas` - Liste arènes (owned + collaborated)
- `GET /api/arenas/:id` - Détails arène avec battles
- `POST /api/arenas` - Créer une arène
- `PUT /api/arenas/:id` - Modifier arène (owner seulement)
- `DELETE /api/arenas/:id` - Supprimer arène (owner seulement)

**Collaboration arène** :
- `GET /api/arena-collaboration/:arenaId/collaborators` - Liste membres
- `POST /api/arena-collaboration/:arenaId/collaborators` - Inviter par email
- `DELETE /api/arena-collaboration/:arenaId/collaborators/:userId` - Retirer membre (owner)
- `POST /api/arena-collaboration/:arenaId/share-links` - Créer lien
- `GET /api/arena-collaboration/:arenaId/share-links` - Liste liens
- `DELETE /api/arena-collaboration/:arenaId/share-links/:linkId` - Supprimer lien
- `POST /api/arena-collaboration/join/:token` - Rejoindre via lien (public)
- `POST /api/arena-collaboration/:arenaId/leave` - Quitter arène (collaborateur)
- `GET /api/arena-collaboration/:arenaId/activities` - Historique

**WebSocket Events** :
- `arena:join` - Rejoindre une arène room
- `arena:leave` - Quitter une arène room
- `arena:updated` - Modification de l'arène (titre, description)
- `arena:deleted` - Arène supprimée
- `battle:created` - Nouvelle battle dans l'arène (broadcast à tous)

### Frontend Arènes

**ArenaContext** :
```javascript
import { useArena } from './contexts/ArenaContext';

const {
  arenas,              // Liste des arènes
  selectedArena,       // Arène actuellement sélectionnée
  setSelectedArena,    // Sélectionner une arène
  loading,             // État chargement
  createArena,         // Créer nouvelle arène
  updateArena,         // Modifier arène
  deleteArena,         // Supprimer arène
  removeArena,         // Retirer arène de la liste (après leave)
  refreshArenas        // Rafraîchir liste arènes
} = useArena();
```

**Composants** :
- `<Sidebar />` - Navigation avec liste d'arènes + "Arena Perso"
- `<CreateArenaDialog />` - Dialog création arène
- `<ArenaSettingsDialog />` - Gestion collaborateurs arène (owner)
- `<ArenaCollaboratorsList />` - Liste membres avec rôles et delete (owner)
- `<ArenaPage />` - Page détails arène avec battles

**Pages** :
- `/arena` - Arena Perso (battles personnelles, arenaId = null)
- `/arenas/:id` - Page arène avec liste battles
- `/arena/join/:token` - Rejoindre arène via lien (public, redirect si non connecté)

### Fonctionnalités Arènes

1. **Sidebar Navigation** :
   - "Arena Perso" pour battles personnelles
   - Liste arènes collaboratives avec count battles
   - Highlight arène sélectionnée
   - Bouton "Créer une arène"
   - Collapsible (toggle avec chevron)

2. **Création Arène** :
   - Dialog avec titre + description
   - Arène créée avec rôle "owner"
   - Ajout instantané dans sidebar

3. **Gestion Collaborateurs** :
   - Invitation par email (owner uniquement)
   - Liens partageables avec rôle (editor/viewer)
   - Liste membres avec avatars et rôles
   - Suppression membres (owner, avec icône poubelle)
   - Count membres (incluant owner)

4. **Rejoindre Arène** :
   - Lien public `/arena/join/:token`
   - Fonctionne même sans compte (redirect vers login/register)
   - Token sauvegardé dans sessionStorage
   - Après login/register, rejoint automatiquement l'arène
   - Mise à jour instantanée sidebar après join

5. **Quitter Arène** :
   - Bouton "Quitter l'arène" pour collaborateurs (pas owner)
   - Confirmation avant de quitter
   - Retrait instantané de la sidebar
   - Redirect vers "/arena"

6. **Permissions Cascade** :
   - Permissions arène appliquées à toutes battles
   - Boutons conditionnels selon rôle
   - Vérification côté serveur

7. **Temps Réel** :
   - WebSocket rooms `arena:{arenaId}`
   - Broadcast battle créée/supprimée
   - Mise à jour count battles en temps réel
   - Notifications collaborateurs

### UX Spécifique Arènes

**Sidebar** :
- "Arena Perso" avec icône Swords (violet)
- Arènes collaboratives avec icône Users (gris)
- Count battles affichée sous chaque arène
- Border highlight pour arène sélectionnée
- Bouton collapse (chevron qui tourne)

**Notifications** :
- Toast avec bouton fermeture (closeButton)
- Position top-right
- Rich colors (sonner)

**Workflow Utilisateur** :

1. **Créer workspace** :
   - Clic "Créer une arène"
   - Remplir titre + description
   - Arène apparaît dans sidebar
   - Navigation automatique vers arène

2. **Inviter collaborateurs** :
   - Ouvrir "Paramètres" (owner seulement)
   - Onglet "Collaborateurs"
   - Inviter par email ou créer lien
   - Lien copié dans presse-papiers

3. **Rejoindre arène** :
   - Cliquer lien d'invitation
   - Se connecter/s'inscrire si nécessaire
   - Rejoint automatiquement arène
   - Arène apparaît dans sidebar
   - Navigation vers page arène

4. **Quitter arène** :
   - Bouton "Quitter l'arène" (collaborateurs)
   - Confirmation
   - Arène disparaît de sidebar
   - Redirect vers Arena Perso

## 🔧 Configuration actuelle

### Ports
- Backend API: **http://localhost:5001**
- Frontend: **http://localhost:5173** (Vite dev server)
- WebSocket: **ws://localhost:5001** (Socket.io sur même port que API)

### Variables d'environnement

**Backend (.env)**:
```env
PORT=5001
DATABASE_URL="file:./dev.db"  # Dev: SQLite, Prod: PostgreSQL
JWT_SECRET="your-secret-key-32-chars-minimum"
NODE_ENV="development"
```

**Frontend (.env.local)**:
```env
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_SOUNDS=true  # Toggle sons
```

## 🚀 Commandes importantes

### Lancer l'application
```bash
# Backend (dans backend/)
bun install              # Installer les dépendances
bunx prisma generate     # Générer le client Prisma
bunx prisma migrate dev  # Créer la BDD
bunx prisma seed         # Ajouter templates et badges
bun run dev              # Lance avec nodemon sur port 5001

# Frontend (dans frontend/)
bun install              # Installer les dépendances
bun run dev              # Lance Vite sur port 3000
```

### Base de données
```bash
cd backend
bunx prisma generate              # Génère le client Prisma
bunx prisma migrate dev           # Crée/applique migrations
bunx prisma studio                # Interface graphique DB
bunx prisma db seed               # Seed templates + badges
```

### Déploiement
```bash
# Frontend
cd frontend
bun run build                     # Build pour production
# Deploy sur Vercel

# Backend
# Deploy sur Railway (PostgreSQL automatique)
```

## 📝 Conventions de code

### Backend
- **ES Modules**: Utiliser `import/export` (type: "module")
- **Messages en français**: Tous les messages d'erreur et réponses
- **Vocabulaire battle**: Utiliser Fighter, Battle, Power Level dans le code
- **Format de réponse API**: `{ success: boolean, message?: string, data?: any }`
- **Validation**: express-validator sur toutes les routes
- **Authentification**: Middleware `protect` sur routes protégées
- **Naming**:
  - camelCase pour variables : `combatScore`, `championFighter`
  - PascalCase pour modèles Prisma : `Battle`, `Fighter`, `Argument`
  - **ATTENTION** : Ne jamais utiliser `arguments` (mot réservé JS), utiliser `argumentsList`

### Frontend
- **Composants fonctionnels**: React hooks uniquement
- **Styling**: TailwindCSS avec classes utilitaires
- **Vocabulaire battle**: Utiliser dans tous les composants et UI
- **State management**:
  - React Context pour auth et collaboration
  - Zustand pour animations/gamification
- **API calls**: Centralisés dans `services/api.js`
- **WebSocket**: `CollaborationContext` avec Socket.io-client
- **Toasts**: Utiliser `sonner` pour notifications
- **Auto-save**: Debounce de 3 secondes avec lodash.debounce
- **Animations**: Framer Motion pour transitions
- **Sons**: Contexte global avec toggle
- **Collaboration**:
  - Hook `useRealtimeBattle` pour synchronisation
  - Émettre events avec `emit()` du context
  - Écouter events avec `on()` / `off()`
  - Toujours nettoyer listeners dans `useEffect` cleanup

## ⚠️ Points d'attention

### Problèmes connus (hérités de DecisionHub)
1. **Port 5001** : Backend utilise 5001 (pas 5000, occupé sur macOS)
2. **Mot réservé `arguments`** : Utiliser `argumentsList` dans les controllers
3. **Routes imbriquées** : `/api/battles/:battleId/fighters/:fighterId/arguments`

### Spécifique à OptionBattle

4. **Auto-save**:
   - Debounce de 3 secondes sur toutes les modifications
   - Indicateur visuel "Saving..." / "Saved"
   - Code pattern:
   ```javascript
   import debounce from 'lodash.debounce';

   const debouncedSave = debounce(async (data) => {
     await api.put(`/battles/${id}`, data);
   }, 3000);
   ```

5. **Calcul des scores**:
   - Power Score = Somme des Attack Powers (weight)
   - Weakness Score = Somme des Weaknesses (weight)
   - Combat Score = Power Score - Weakness Score
   - Champion = Fighter avec le Combat Score le plus élevé
   - Code:
   ```javascript
   const fighters = battle.fighters.map(fighter => {
     const powers = fighter.arguments.filter(arg => arg.type === 'power');
     const weaknesses = fighter.arguments.filter(arg => arg.type === 'weakness');
     const powerScore = powers.reduce((sum, arg) => sum + arg.weight, 0);
     const weaknessScore = weaknesses.reduce((sum, arg) => sum + arg.weight, 0);
     const combatScore = powerScore - weaknessScore;
     return { ...fighter, combatScore, powerScore, weaknessScore };
   });
   const champion = fighters.reduce((max, f) => f.combatScore > max.combatScore ? f : max);
   ```

6. **Système de badges**:
   - 8 badges : First Blood, Veteran, Champion, Speed Demon, Analyst, Wise, Eliminator, Completionist
   - Débloquage automatique côté backend via service
   - Animation + son + confetti au débloquage
   - Stockage : table `Badge` avec userId + badgeType + unlockedAt

7. **Sons**:
   - 5 fichiers : victory.mp3, badge-unlock.mp3, fighter-added.mp3, battle-complete.mp3, power-up.mp3
   - Context global avec toggle on/off
   - Sources : Mixkit.co, Freesound.org, ZapSplat.com
   - Volume par défaut : 0.5

8. **Animations**:
   - Framer Motion : fade-in, slide-in, bounce
   - Confetti : react-confetti au débloquage de badge
   - Shake animation sur victoire
   - Tailwind custom animations dans tailwind.config.js:
   ```javascript
   theme: {
     extend: {
       animation: {
         'shake': 'shake 0.5s ease-in-out',
         'bounce-in': 'bounceIn 0.6s ease-out',
         'slide-in': 'slideIn 0.3s ease-out'
       },
       keyframes: {
         shake: {
           '0%, 100%': { transform: 'translateX(0)' },
           '25%': { transform: 'translateX(-10px)' },
           '75%': { transform: 'translateX(10px)' }
         },
         // ... autres keyframes
       }
     }
   }
   ```

## 🔐 Sécurité

### Fichiers à NE JAMAIS commit
- `.env` (backend)
- `.env.local` (frontend)
- `*.db` et `*.db-journal` (base de données)
- `node_modules/`
- `.bun/`

Le `.gitignore` est configuré pour protéger ces fichiers.

### Données sensibles
- JWT_SECRET doit être changé en production (32+ caractères)
- Ne jamais logger les tokens ou passwords
- Fichiers audio : vérifier les licences (utiliser Creative Commons)

## 📚 API Routes

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Profil (protégé)

### Battles (toutes protégées)
- `GET /api/battles` - Liste (query: ?status=draft/active/completed)
- `GET /api/battles/:id` - Détails avec fighters et arguments
- `POST /api/battles` - Lancer une battle
- `PUT /api/battles/:id` - Modifier (auto-save)
- `DELETE /api/battles/:id` - Supprimer
- `GET /api/battles/:id/champion` - Obtenir le champion

### Fighters (imbriqué sous battles)
- `GET /api/battles/:battleId/fighters` - Liste
- `POST /api/battles/:battleId/fighters` - Ajouter un fighter
- `PUT /api/battles/:battleId/fighters/:id` - Modifier
- `DELETE /api/battles/:battleId/fighters/:id` - Supprimer

### Arguments (imbriqué sous fighters)
- `GET /api/battles/:battleId/fighters/:fighterId/arguments` - Liste
- `POST /api/battles/:battleId/fighters/:fighterId/arguments` - Ajouter
- `PUT /api/battles/:battleId/fighters/:fighterId/arguments/:id` - Modifier
- `DELETE /api/battles/:battleId/fighters/:fighterId/arguments/:id` - Supprimer

### Badges (protégé)
- `GET /api/badges` - Badges débloqués de l'utilisateur
- `GET /api/badges/all` - Tous les badges disponibles

### Templates (public)
- `GET /api/templates` - Liste des Quick Battles
- `POST /api/templates/:id/use` - Créer une battle depuis un template

## 📦 Dépendances principales

### Backend (package.json)
```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "express-validator": "^7.2.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "nanoid": "^5.0.4",
    "socket.io": "^4.8.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.7",
    "prisma": "^5.22.0"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "socket.io-client": "^4.8.1",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "react-confetti": "^6.1.0",
    "lucide-react": "^0.344.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "lodash.debounce": "^4.0.8",
    "date-fns": "^3.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "sonner": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "vite": "^5.1.0"
  }
}
```

## 🎨 Design System

### Couleurs (tailwind.config.js)
```javascript
colors: {
  battle: {
    primary: '#8B5CF6',    // Violet pour les batailles
    secondary: '#10B981',  // Vert pour victoires
    danger: '#EF4444',     // Rouge pour faiblesses
    warning: '#F59E0B',    // Orange pour alertes
  }
}
```

### Thème visuel
- **Style battle épique** : dégradés, ombres, effets de glow
- **Animations dynamiques** : shake, bounce, slide-in
- **Icons** : Lucide React (Sword, Shield, Trophy, Zap, etc.)
- **Responsive**: Mobile-first avec Tailwind breakpoints

## 🎮 Système de gamification

### Badges (8 au total)
1. **First Blood** - Créer ta première battle
2. **Veteran** - Créer 10 battles
3. **Champion** - Terminer 5 battles
4. **Speed Demon** - Créer une battle en moins de 2 minutes
5. **Analyst** - Créer une battle avec 5+ fighters
6. **Wise** - Ajouter 20+ arguments au total
7. **Eliminator** - Supprimer 10 fighters
8. **Completionist** - Utiliser tous les templates

### Logique de débloquage
- **Backend** : Service `badgeService.js` vérifie les conditions après chaque action
- **Trigger** : Après POST/PUT/DELETE sur battles, fighters, arguments
- **Notification** : Retourne `{ badge: { type, name, description } }` si nouveau badge
- **Frontend** : Affiche animation + confetti + son

### Stats utilisateur
- Batailles créées
- Batailles terminées
- Fighters totaux
- Arguments totaux
- Badges débloqués (X/8)

## 🚀 Plan de développement (12 étapes - 48h)

### Phase 1 : Fondations (10h)
1. ✅ Setup structure + config (2h) - FAIT
2. Backend Auth (2h)
3. Backend Battles CRUD (3h)
4. Frontend Auth UI (3h)

### Phase 2 : Core Features (14h)
5. Battle Arena (4h) - Dashboard avec filtres
6. Battle Editor (5h) - Formulaire + auto-save
7. Système de gamification (5h) - Badges + service

### Phase 3 : Polish (12h)
8. Animations + sons (4h) - Framer Motion + audio
9. Quick Battles (3h) - Templates + seed
10. Export PDF (2h) - jsPDF
11. Tests manuels (2h)
12. Déploiement (1h) - Vercel + Railway

### Phase 4 : Future (optionnel)
- Collaboration (partage, votes)
- Notifications email
- Stats avancées (graphiques)
- Mode hors ligne (PWA)

## 🐛 Debugging

### Backend
```bash
# Tester l'API
curl http://localhost:5001/health
curl http://localhost:5001/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# Vérifier la BDD
bunx prisma studio
```

### Frontend
- DevTools Console : erreurs React
- Network tab : requêtes API
- React DevTools : state et contexts

### Auto-save
- Vérifier le debounce dans la console : `console.log('Auto-saving...')`
- Indicateur visuel : badge "Saving..." / "Saved"

## 🔄 Git Workflow

```bash
git add .
git commit -m "feat(battle): add auto-save with debounce"
git push origin main
```

Conventions de commit:
- `feat(scope):` - Nouvelle fonctionnalité
- `fix(scope):` - Correction de bug
- `docs:` - Documentation (CLAUDE.md, README)
- `refactor:` - Refactoring
- `style:` - Formatage
- `chore:` - Maintenance (deps, config)

## 📞 Support

- Repository: https://github.com/Ryzlane/optionbattle
- Issues: https://github.com/Ryzlane/optionbattle/issues

## 💡 Notes importantes

### Différences avec DecisionHub
- ✅ Gamification complète
- ✅ Auto-save (vs save manuel)
- ✅ Animations + sons
- ✅ Templates pré-configurés
- ✅ Export PDF
- ✅ Vocabulaire battle

### Inspirations
- Mortal Kombat (visuels de combat)
- Duolingo (système de badges)
- Notion (auto-save fluide)

### Philosophie
> "Let your options fight it out. The best one always wins."

Rendre la prise de décision **ludique, engageante et addictive** grâce à la gamification.

---

## 📋 État actuel du projet (Mise à jour: 2026-02-16)

### ✅ Fonctionnalités implémentées (98%)

**Backend complet** :
- ✅ Authentification JWT (register, login, me)
- ✅ CRUD Battles avec auto-calcul des scores
- ✅ CRUD Fighters (options) avec ordre automatique
- ✅ CRUD Arguments (powers/weaknesses) avec weight 1-5
- ✅ Système de badges complet (5 badges, débloquage automatique)
- ✅ Service de scoring en temps réel
- ✅ Sécurité (helmet, CORS, rate limiting)
- ✅ Validation express-validator sur toutes les routes
- ✅ Routes imbriquées : `/api/battles/:id/fighters/:id/arguments`
- ✅ **WebSocket Socket.io pour collaboration temps réel**
- ✅ **API Collaboration complète (invitations, liens, permissions)**
- ✅ **Système de permissions (owner/editor/viewer)**
- ✅ **Modèles Collaboration, ShareLink, Activity**

**Frontend complet** :
- ✅ Pages Auth (Login + Register) avec design battle-themed
- ✅ Dashboard (Battle Arena) avec filtres et stats
- ✅ Battle Editor complet avec auto-save (debounce 3s)
- ✅ FighterCard avec score bar en temps réel
- ✅ AddFighterDialog / AddArgumentDialog avec Power Level slider
- ✅ Champion badge et banner
- ✅ ArgumentItem avec delete et power level visuel
- ✅ Layout avec header, navigation, user menu
- ✅ Composants UI Radix (Button, Input, Card, Dialog, Slider, Label)
- ✅ Hook useAutoSave pour sauvegarde automatique
- ✅ Hook useBadges pour gamification
- ✅ Design responsive et accessible
- ✅ **CollaborationContext avec Socket.io-client**
- ✅ **Hook useRealtimeBattle pour synchronisation**
- ✅ **ShareDialog avec invitations email + liens**
- ✅ **CollaboratorsList avec gestion permissions**
- ✅ **OnlineIndicator avec présence temps réel**
- ✅ **JoinBattlePage pour rejoindre via lien**

**Système de gamification** :
- ✅ 5 badges implémentés (First Blood, Veteran, Champion, Analyst, Wise)
- ✅ API `/badges/my`, `/badges/all`, `/badges/check`
- ✅ BadgeService avec conditions de débloquage automatiques
- ✅ Composants BadgeItem et BadgeNotification (avec confetti)

**Collaboration temps réel** :
- ✅ WebSocket avec Socket.io (rooms par battle)
- ✅ Synchronisation instantanée multi-utilisateurs
- ✅ 3 niveaux de permissions (owner/editor/viewer)
- ✅ Invitation par email (utilisateurs existants)
- ✅ Liens partageables avec token unique
- ✅ Gestion collaborateurs (ajout/retrait)
- ✅ Indicateurs de présence en ligne
- ✅ Notifications toast des actions collaborateurs
- ✅ Historique d'activité (Activity model)
- ✅ Permissions vérifiées côté serveur (sécurité)
- ✅ Reconnexion automatique Socket.io
- ✅ Bouton "Quitter la battle" pour collaborateurs

**Arènes collaboratives (Workspaces)** :
- ✅ Backend complet (Arena, ArenaCollaboration, ArenaShareLink, ArenaActivity)
- ✅ API Routes arènes (CRUD complet)
- ✅ API Collaboration arène (invitations, liens, gestion membres)
- ✅ WebSocket events arènes (join, leave, update, battle:created)
- ✅ Frontend ArenaContext avec state management
- ✅ Sidebar navigation avec liste arènes + "Arena Perso"
- ✅ CreateArenaDialog et ArenaPage
- ✅ ArenaSettingsDialog (gestion collaborateurs, owner)
- ✅ ArenaCollaboratorsList avec rôles et delete
- ✅ Permissions cascade arène → battles
- ✅ Rejoindre arène sans compte (redirect login/register)
- ✅ Bouton "Quitter l'arène" pour collaborateurs
- ✅ Mise à jour instantanée sidebar (leave, join)
- ✅ Count membres et battles en temps réel
- ✅ Notifications avec bouton fermeture

### 📝 À faire (optionnel - 5%)

**Templates** :
- Quick Battles pré-configurés (5 templates)
- Seed data avec templates
- Page Templates dans le frontend

**Animations & Sons** :
- Fichiers audio (5 sons)
- SoundContext avec toggle
- Animations Framer Motion supplémentaires

**Export** :
- Export PDF avec jsPDF
- Rapports de battle formatés

**Déploiement** :
- Frontend sur Vercel
- Backend + PostgreSQL sur Railway
- Variables d'environnement de production

### 🚀 Commandes de lancement

```bash
# Backend
cd backend
bun install
bunx prisma generate
bunx prisma migrate dev
bun run dev  # Port 5001

# Frontend
cd frontend
bun install
bun run dev  # Port 5173
```

### 🔗 URLs

- **Backend API** : http://localhost:5001
- **Frontend** : http://localhost:5173
- **Health check** : http://localhost:5001/health

---

**Développé avec Claude Code** 🤖⚔️

**Date de création** : Février 2026
**Version** : 0.9 (MVP fonctionnel)
**Statut** : ✅ Production-ready (core features)
