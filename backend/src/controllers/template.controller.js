import { PrismaClient } from '@prisma/client';
import { getAllTemplates, getTemplateById } from '../services/templateService.js';

const prisma = new PrismaClient();

/**
 * GET /api/templates
 * Récupérer tous les templates disponibles
 */
export const getTemplates = async (req, res) => {
  try {
    const templates = getAllTemplates();

    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    console.error('Erreur récupération templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des templates'
    });
  }
};

/**
 * GET /api/templates/:id
 * Récupérer un template spécifique avec détails complets
 */
export const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }

    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    console.error('Erreur récupération template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du template'
    });
  }
};

/**
 * POST /api/templates/:id/use
 * Créer une battle depuis un template
 */
export const useBattleTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer le template
    const template = getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }

    // Créer la battle
    const battle = await prisma.battle.create({
      data: {
        title: template.title,
        description: template.description,
        status: 'active',
        userId,
        fighters: {
          create: template.fighters.map((fighter, index) => ({
            name: fighter.name,
            description: fighter.description,
            order: index,
            arguments: {
              create: fighter.arguments.map(arg => ({
                text: arg.text,
                type: arg.type,
                weight: arg.weight
              }))
            }
          }))
        }
      },
      include: {
        fighters: {
          include: {
            arguments: true
          }
        }
      }
    });

    // Calculer les scores et déterminer le champion avec la fonction du utils/scoring.js
    const { calculateBattleScores } = await import('../utils/scoring.js');
    await calculateBattleScores(prisma, battle.id);

    // Récupérer la battle mise à jour
    const updatedBattle = await prisma.battle.findUnique({
      where: { id: battle.id },
      include: {
        fighters: {
          include: {
            arguments: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: `Battle "${template.title}" créée depuis le template ! ⚔️`,
      data: { battle: updatedBattle }
    });
  } catch (error) {
    console.error('Erreur utilisation template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la battle depuis le template'
    });
  }
};
