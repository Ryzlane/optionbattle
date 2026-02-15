import { validationResult } from 'express-validator';

/**
 * Middleware de validation
 * Vérifie les erreurs de validation et retourne une réponse appropriée
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};
