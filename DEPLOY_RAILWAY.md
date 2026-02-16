# 🚂 Déploiement OptionBattle sur Railway - Guide Complet

## Pourquoi Railway ?

✅ **Tout-en-un** : Backend + Frontend + PostgreSQL sur une seule plateforme  
✅ **Git-based** : Push GitHub → déploiement automatique  
✅ **Gratuit pour commencer** : 5$/mois de crédit gratuit  
✅ **PostgreSQL managée** : Base de données incluse  
✅ **Domaines custom** : Connectez votre propre domaine

---

## 📋 Prérequis

1. Compte GitHub (pour push du code)
2. Compte Railway (gratuit : https://railway.app)
3. Code OptionBattle prêt (backend + frontend)

---

## 🚀 Étape 1 : Créer un compte Railway

1. Allez sur https://railway.app
2. Cliquez sur "Start a New Project"
3. Connectez-vous avec GitHub
4. Autorisez Railway à accéder à vos repos

---

## 📦 Étape 2 : Pousser votre code sur GitHub

### 2.1 Initialiser Git (si pas déjà fait)

```bash
cd /Users/ryzlane/claudeProjects/optionbattle
git init
git add .
git commit -m "Initial commit - OptionBattle ready for Railway"
```

### 2.2 Créer un repo sur GitHub

1. Allez sur https://github.com/new
2. Nom : `optionbattle`
3. Privé ou Public (votre choix)
4. **NE PAS** initialiser avec README (vous avez déjà du code)
5. Cliquez sur "Create repository"

### 2.3 Pousser le code

```bash
git remote add origin https://github.com/VOTRE_USERNAME/optionbattle.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Étape 3 : Créer la base de données PostgreSQL

1. Dans Railway, cliquez sur "New Project"
2. Sélectionnez "Provision PostgreSQL"
3. Railway crée automatiquement une DB PostgreSQL
4. Copiez la variable `DATABASE_URL` (onglet "Variables")

**Format** : `postgresql://user:password@host:5432/railway`

---

## 🔧 Étape 4 : Déployer le Backend

### 4.1 Ajouter le service Backend

1. Dans votre projet Railway, cliquez sur "+ New"
2. Sélectionnez "GitHub Repo"
3. Choisissez `optionbattle`
4. Railway détecte automatiquement Node.js

### 4.2 Configurer le Backend

1. Cliquez sur le service Backend
2. Allez dans "Settings" → "Root Directory"
3. Changez en `/backend` ⚠️ **IMPORTANT**
4. Dans "Build Command", laissez vide (Railway utilise npm build automatiquement)
5. Dans "Start Command", mettez : `node src/server.js`

### 4.3 Ajouter les Variables d'Environnement

Dans "Variables", ajoutez :

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway auto-link
NODE_ENV=production
PORT=5001
JWT_SECRET=votre-secret-jwt-super-securise-minimum-32-caracteres
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ryzlane@gmail.com
SMTP_PASSWORD=rniqxsbfalqiqcvk
SMTP_FROM=ryzlane@gmail.com
FRONTEND_URL=https://optionbattle.up.railway.app  # À modifier après
RESET_TOKEN_EXPIRES=15
```

⚠️ **Important** :
- Remplacez `JWT_SECRET` par une vraie valeur sécurisée (min 32 caractères)
- `DATABASE_URL` : utilisez `${{Postgres.DATABASE_URL}}` pour auto-link
- `FRONTEND_URL` : vous le mettrez à jour après avoir déployé le frontend

### 4.4 Déployer

Railway démarre automatiquement le build et le déploiement. Attendez que ça finisse (2-3 minutes).

**URL Backend** : Railway vous donne une URL comme `https://optionbattle-backend.up.railway.app`

---

## 🎨 Étape 5 : Déployer le Frontend

### 5.1 Ajouter le service Frontend

1. Dans votre projet Railway, cliquez sur "+ New"
2. Sélectionnez "GitHub Repo"
3. Choisissez le même repo `optionbattle`
4. Railway détecte Vite

### 5.2 Configurer le Frontend

1. Cliquez sur le service Frontend
2. Allez dans "Settings" → "Root Directory"
3. Changez en `/frontend` ⚠️ **IMPORTANT**
4. Build Command : `npm run build`
5. Start Command : `npm run preview` (Vite preview pour production)

### 5.3 Ajouter les Variables d'Environnement

Dans "Variables", ajoutez :

```env
VITE_API_URL=https://votre-backend.up.railway.app
```

⚠️ Remplacez par l'URL réelle de votre backend Railway (étape 4.4).

### 5.4 Déployer

Railway démarre le build (2-3 minutes).

**URL Frontend** : Railway vous donne une URL comme `https://optionbattle.up.railway.app`

---

## 🔄 Étape 6 : Connecter Backend ↔ Frontend

### 6.1 Mettre à jour FRONTEND_URL dans le Backend

1. Retournez dans les variables du Backend
2. Changez `FRONTEND_URL` avec l'URL réelle du frontend :
   ```
   FRONTEND_URL=https://optionbattle.up.railway.app
   ```
3. Railway redémarre automatiquement le backend

### 6.2 Configurer CORS

Votre backend doit autoriser le frontend. Vérifiez dans `backend/src/server.js` :

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Si vous voulez autoriser tous les domaines Railway en dev :

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true,
  credentials: true
}));
```

---

## ✅ Étape 7 : Tester en Production

### 7.1 Vérifier que tout fonctionne

1. Allez sur `https://votre-frontend.up.railway.app`
2. Inscrivez-vous avec un nouvel utilisateur
3. Testez "Mot de passe oublié" → email doit arriver
4. Créez une battle
5. Invitez un utilisateur par email
6. Testez la suppression de compte

### 7.2 Vérifier les logs

Si problème, cliquez sur les services dans Railway → "Logs" pour voir les erreurs.

---

## 🌐 Étape 8 (Optionnel) : Domaine Custom

1. Dans Railway, cliquez sur votre service Frontend
2. Allez dans "Settings" → "Domains"
3. Cliquez sur "Custom Domain"
4. Ajoutez votre domaine (ex: `optionbattle.com`)
5. Railway vous donne un CNAME à configurer chez votre registrar (OVH, Namecheap, etc.)
6. Mettez à jour `FRONTEND_URL` dans les variables backend

---

## 💰 Coûts Railway

- **Plan Hobby (gratuit)** : 5$/mois de crédit inclus
  - 500h d'exécution/mois (environ 24/7 pour 1 service)
  - Base de données PostgreSQL incluse
  - **Suffisant pour tester et petite utilisation**

- **Plan Pro** : 20$/mois si vous dépassez
  - Plus de ressources
  - Support prioritaire

**Estimation pour OptionBattle** :
- Backend + Frontend + PostgreSQL = ~10-15$/mois si usage modéré
- **Les 5$ gratuits couvrent les tests initiaux**

---

## 🔧 Dépannage

### Erreur : "DATABASE_URL not found"
→ Vérifiez que PostgreSQL est bien lié au backend : `${{Postgres.DATABASE_URL}}`

### Erreur : "Prisma Client not generated"
→ Ajoutez `"postinstall": "prisma generate"` dans `backend/package.json` scripts

### Erreur : "CORS blocked"
→ Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL réelle du frontend

### Frontend ne charge pas
→ Vérifiez `VITE_API_URL` dans les variables du frontend

### Emails ne partent pas
→ Vérifiez `SMTP_USER` et `SMTP_PASSWORD` dans les variables backend

---

## 📝 Checklist Finale

- ✅ Code sur GitHub
- ✅ PostgreSQL créée sur Railway
- ✅ Backend déployé avec toutes les variables d'env
- ✅ Frontend déployé avec VITE_API_URL
- ✅ FRONTEND_URL mise à jour dans le backend
- ✅ CORS configuré correctement
- ✅ Tests : inscription, battle, email, suppression compte
- ✅ Logs vérifiés (pas d'erreurs)

---

## 🎉 C'est fait !

Votre OptionBattle est maintenant en production sur Railway ! 🚀

**URLs** :
- Frontend : `https://votre-app.up.railway.app`
- Backend : `https://votre-backend.up.railway.app`
- DB : PostgreSQL managée par Railway

**Déploiement continu** : À chaque `git push` sur `main`, Railway redéploie automatiquement ! 🔥
