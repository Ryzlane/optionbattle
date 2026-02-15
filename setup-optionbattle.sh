#!/bin/bash

# ⚔️ OptionBattle - Script d'installation automatique
# Baseline: "Let your options fight it out. The best one always wins."

echo "⚔️  Initialisation d'OptionBattle..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun n'est pas installé. Installation..."
    curl -fsSL https://bun.sh/install | bash
fi

echo "${BLUE}📦 Installation Backend...${NC}"
cd backend

# Installer dépendances
bun install

# Init Prisma
echo "${BLUE}🗄️  Configuration Prisma...${NC}"
bunx prisma init --datasource-provider sqlite

# Créer structure dossiers backend
mkdir -p src/{routes,controllers,middleware,services,utils}
mkdir -p prisma

echo "${GREEN}✅ Backend configuré${NC}"

cd ../

echo "${BLUE}📦 Installation Frontend...${NC}"
cd frontend

# Init Vite React
bun create vite . --template react

# Installer dépendances
bun install
bun install react-router-dom axios zustand framer-motion react-confetti lucide-react jspdf jspdf-autotable lodash.debounce date-fns
bun install @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-label @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-slot
bun install class-variance-authority clsx tailwind-merge
bun install -D tailwindcss postcss autoprefixer

# Init Tailwind
bunx tailwindcss init -p

# Créer structure dossiers frontend
mkdir -p src/components/{auth,battle,arena,gamification,animations,shared,templates,export}
mkdir -p src/pages/{auth}
mkdir -p src/{contexts,hooks,services,utils,styles}
mkdir -p public/sounds

echo "${GREEN}✅ Frontend configuré${NC}"

cd ../

echo "${GREEN}"
echo "🎉 OptionBattle est prêt !"
echo ""
echo "Prochaines étapes :"
echo "1. cd optionbattle/backend"
echo "2. Configurer .env"
echo "3. bunx prisma migrate dev --name init"
echo "4. bunx prisma seed"
echo "5. bun run dev (backend)"
echo "6. cd ../frontend && bun run dev"
echo "${NC}"
