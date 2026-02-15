/**
 * Service de templates de battles pré-configurées
 */

export const BATTLE_TEMPLATES = [
  {
    id: 'smartphone-battle',
    title: 'iPhone vs Android',
    description: 'Le grand classique : quel smartphone choisir ?',
    icon: '📱',
    category: 'tech',
    fighters: [
      {
        name: 'iPhone 16 Pro',
        description: 'Le flagship Apple avec puce A18 Pro',
        arguments: [
          { type: 'power', text: 'Écosystème Apple intégré (Mac, iPad, Watch)', weight: 5 },
          { type: 'power', text: 'Qualité photo/vidéo exceptionnelle', weight: 4 },
          { type: 'power', text: 'Support logiciel 5+ ans garantis', weight: 5 },
          { type: 'power', text: 'Build quality premium (titane)', weight: 4 },
          { type: 'weakness', text: 'Prix très élevé (1200€+)', weight: 5 },
          { type: 'weakness', text: 'Personnalisation limitée', weight: 3 },
          { type: 'weakness', text: 'Port Lightning/USB-C seulement', weight: 2 }
        ]
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Le flagship Android avec S Pen',
        arguments: [
          { type: 'power', text: 'Écran 120Hz AMOLED exceptionnel', weight: 5 },
          { type: 'power', text: 'S Pen intégré pour productivité', weight: 4 },
          { type: 'power', text: 'Personnalisation Android complète', weight: 5 },
          { type: 'power', text: 'Zoom optique x10 impressionnant', weight: 4 },
          { type: 'weakness', text: 'Prix élevé (aussi 1200€+)', weight: 4 },
          { type: 'weakness', text: 'OneUI peut être lourd', weight: 2 },
          { type: 'weakness', text: 'Batterie moyenne pour la taille', weight: 3 }
        ]
      }
    ]
  },

  {
    id: 'framework-js',
    title: 'React vs Vue vs Svelte',
    description: 'Quel framework JavaScript choisir pour ton projet ?',
    icon: '⚛️',
    category: 'dev',
    fighters: [
      {
        name: 'React',
        description: 'Le leader du marché par Meta',
        arguments: [
          { type: 'power', text: 'Écosystème énorme (libs, jobs)', weight: 5 },
          { type: 'power', text: 'React Native pour mobile', weight: 4 },
          { type: 'power', text: 'Composants réutilisables', weight: 4 },
          { type: 'weakness', text: 'Courbe d\'apprentissage JSX', weight: 3 },
          { type: 'weakness', text: 'Besoin de libs tierces (routing, state)', weight: 3 }
        ]
      },
      {
        name: 'Vue',
        description: 'Le framework progressif',
        arguments: [
          { type: 'power', text: 'Documentation excellente', weight: 5 },
          { type: 'power', text: 'Facile à apprendre', weight: 5 },
          { type: 'power', text: 'Composition API moderne', weight: 4 },
          { type: 'weakness', text: 'Moins de jobs que React', weight: 4 },
          { type: 'weakness', text: 'Écosystème plus petit', weight: 3 }
        ]
      },
      {
        name: 'Svelte',
        description: 'Le framework compilé ultra-rapide',
        arguments: [
          { type: 'power', text: 'Performance native (compilé)', weight: 5 },
          { type: 'power', text: 'Syntaxe la plus simple', weight: 5 },
          { type: 'power', text: 'Bundle size minimal', weight: 4 },
          { type: 'weakness', text: 'Écosystème encore jeune', weight: 4 },
          { type: 'weakness', text: 'Peu de jobs sur le marché', weight: 5 }
        ]
      }
    ]
  },

  {
    id: 'vacation-destination',
    title: 'Bali vs Thaïlande vs Japon',
    description: 'Destination pour tes prochaines vacances ?',
    icon: '✈️',
    category: 'travel',
    fighters: [
      {
        name: 'Bali (Indonésie)',
        description: 'L\'île des dieux',
        arguments: [
          { type: 'power', text: 'Coût de la vie très bas', weight: 5 },
          { type: 'power', text: 'Plages paradisiaques', weight: 5 },
          { type: 'power', text: 'Culture balinaise unique', weight: 4 },
          { type: 'weakness', text: 'Très touristique (Ubud, Canggu)', weight: 4 },
          { type: 'weakness', text: 'Traffic intense', weight: 3 }
        ]
      },
      {
        name: 'Thaïlande',
        description: 'Le pays du sourire',
        arguments: [
          { type: 'power', text: 'Diversité (îles, montagnes, villes)', weight: 5 },
          { type: 'power', text: 'Food incroyable et pas cher', weight: 5 },
          { type: 'power', text: 'Infrastructure touristique mature', weight: 4 },
          { type: 'weakness', text: 'Surpeuplé en haute saison', weight: 4 },
          { type: 'weakness', text: 'Arnaque touristique fréquente', weight: 3 }
        ]
      },
      {
        name: 'Japon',
        description: 'Tradition et modernité',
        arguments: [
          { type: 'power', text: 'Culture fascinante', weight: 5 },
          { type: 'power', text: 'Sécurité absolue', weight: 5 },
          { type: 'power', text: 'Transports ultra-efficaces', weight: 5 },
          { type: 'power', text: 'Food de qualité exceptionnelle', weight: 4 },
          { type: 'weakness', text: 'Coût élevé (300€/jour)', weight: 5 },
          { type: 'weakness', text: 'Barrière de la langue', weight: 4 }
        ]
      }
    ]
  },

  {
    id: 'remote-work',
    title: 'Remote vs Bureau vs Hybrid',
    description: 'Quel mode de travail privilégier ?',
    icon: '💼',
    category: 'work',
    fighters: [
      {
        name: 'Full Remote',
        description: '100% télétravail',
        arguments: [
          { type: 'power', text: 'Zéro temps de transport', weight: 5 },
          { type: 'power', text: 'Flexibilité horaire', weight: 5 },
          { type: 'power', text: 'Travailler de n\'importe où', weight: 4 },
          { type: 'weakness', text: 'Isolement social', weight: 4 },
          { type: 'weakness', text: 'Séparation vie pro/perso difficile', weight: 3 }
        ]
      },
      {
        name: 'Bureau (Présentiel)',
        description: 'Au bureau tous les jours',
        arguments: [
          { type: 'power', text: 'Collaboration spontanée', weight: 4 },
          { type: 'power', text: 'Socialisation avec collègues', weight: 4 },
          { type: 'power', text: 'Séparation claire vie pro/perso', weight: 4 },
          { type: 'weakness', text: 'Temps de transport quotidien', weight: 5 },
          { type: 'weakness', text: 'Distractions (open space)', weight: 3 },
          { type: 'weakness', text: 'Moins de flexibilité', weight: 4 }
        ]
      },
      {
        name: 'Hybride (3j/2j)',
        description: 'Mix remote et bureau',
        arguments: [
          { type: 'power', text: 'Meilleur des deux mondes', weight: 5 },
          { type: 'power', text: 'Flexibilité + socialisation', weight: 5 },
          { type: 'power', text: 'Économie transport partielle', weight: 3 },
          { type: 'weakness', text: 'Logistique compliquée (matériel)', weight: 3 },
          { type: 'weakness', text: 'Besoin de discipliner son agenda', weight: 2 }
        ]
      }
    ]
  },

  {
    id: 'gaming-console',
    title: 'PS5 vs Xbox Series X vs PC Gaming',
    description: 'Sur quelle plateforme jouer ?',
    icon: '🎮',
    category: 'gaming',
    fighters: [
      {
        name: 'PlayStation 5',
        description: 'La console Sony next-gen',
        arguments: [
          { type: 'power', text: 'Exclusivités de qualité (GoW, Spider-Man)', weight: 5 },
          { type: 'power', text: 'DualSense avec retour haptique', weight: 4 },
          { type: 'power', text: 'Prix abordable (500€)', weight: 4 },
          { type: 'weakness', text: 'Stock limité', weight: 3 },
          { type: 'weakness', text: 'Jeux chers (70-80€)', weight: 4 }
        ]
      },
      {
        name: 'Xbox Series X',
        description: 'La console Microsoft puissante',
        arguments: [
          { type: 'power', text: 'Game Pass incroyable (400+ jeux)', weight: 5 },
          { type: 'power', text: 'Rétrocompatibilité totale', weight: 4 },
          { type: 'power', text: 'Plus puissante techniquement', weight: 4 },
          { type: 'weakness', text: 'Peu d\'exclusivités majeures', weight: 5 },
          { type: 'weakness', text: 'Interface UI moins élégante', weight: 2 }
        ]
      },
      {
        name: 'PC Gaming',
        description: 'La plateforme ultime',
        arguments: [
          { type: 'power', text: 'Performances maximales (RTX 4090)', weight: 5 },
          { type: 'power', text: 'Mods et personnalisation', weight: 5 },
          { type: 'power', text: 'Multi-usage (work + gaming)', weight: 4 },
          { type: 'power', text: 'Steam sales + Game Pass PC', weight: 4 },
          { type: 'weakness', text: 'Coût initial très élevé (1500€+)', weight: 5 },
          { type: 'weakness', text: 'Maintenance et upgrades nécessaires', weight: 3 }
        ]
      }
    ]
  }
];

/**
 * Récupérer tous les templates
 */
export const getAllTemplates = () => {
  return BATTLE_TEMPLATES.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    icon: t.icon,
    category: t.category,
    fightersCount: t.fighters.length
  }));
};

/**
 * Récupérer un template par ID
 */
export const getTemplateById = (templateId) => {
  return BATTLE_TEMPLATES.find(t => t.id === templateId);
};

/**
 * Créer une battle depuis un template
 */
export const createBattleFromTemplate = (template, userId) => {
  return {
    title: template.title,
    description: template.description,
    status: 'active',
    userId,
    fighters: template.fighters
  };
};
