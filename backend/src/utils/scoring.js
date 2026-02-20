/**
 * Service de calcul des scores de combat
 */

/**
 * Calcule le score de combat d'un fighter
 * Combat Score = Power Score - Weakness Score
 */
export const calculateFighterScore = (argumentsList) => {
  const powers = argumentsList.filter(arg => arg.type === 'power');
  const weaknesses = argumentsList.filter(arg => arg.type === 'weakness');

  const powerScore = powers.reduce((sum, arg) => sum + arg.weight, 0);
  const weaknessScore = weaknesses.reduce((sum, arg) => sum + arg.weight, 0);
  const combatScore = powerScore - weaknessScore;

  return {
    combatScore,
    powerScore,
    weaknessScore,
    powerCount: powers.length,
    weaknessCount: weaknesses.length
  };
};

/**
 * Trouve le champion (fighter avec le meilleur score)
 * Retourne null s'il y a égalité
 */
export const findChampion = (fighters) => {
  if (!fighters || fighters.length === 0) return null;

  // Trouver le score maximal
  const maxScore = Math.max(...fighters.map(f => f.score || 0));

  // Trouver tous les fighters avec ce score
  const topFighters = fighters.filter(f => (f.score || 0) === maxScore);

  // S'il y a égalité (plusieurs fighters au même score max), retourner null
  if (topFighters.length > 1) {
    return null;
  }

  // Sinon retourner le champion unique
  return topFighters[0];
};

/**
 * Calcule les scores pour tous les fighters d'une battle
 */
export const calculateBattleScores = async (prisma, battleId) => {
  const fighters = await prisma.fighter.findMany({
    where: { battleId },
    include: {
      arguments: true
    }
  });

  const fightersWithScores = fighters.map(fighter => {
    const { combatScore } = calculateFighterScore(fighter.arguments);
    return {
      ...fighter,
      score: combatScore
    };
  });

  // Mettre à jour les scores dans la BDD
  await Promise.all(
    fightersWithScores.map(fighter =>
      prisma.fighter.update({
        where: { id: fighter.id },
        data: { score: fighter.score }
      })
    )
  );

  // Trouver et mettre à jour le champion
  const champion = findChampion(fightersWithScores);

  // Mettre à jour le championId (peut être null en cas d'égalité)
  await prisma.battle.update({
    where: { id: battleId },
    data: { championId: champion ? champion.id : null }
  });

  return fightersWithScores;
};
