/**
 * Middleware de gestion globale des erreurs
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreur Prisma (contrainte unique, etc.)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà'
    });
  }

  // Erreur Prisma (record non trouvé)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Ressource non trouvée'
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne'
  });
};
