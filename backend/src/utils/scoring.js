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
 */
export const findChampion = (fighters) => {
  if (!fighters || fighters.length === 0) return null;

  return fighters.reduce((champion, fighter) => {
    return (fighter.score || 0) > (champion.score || 0) ? fighter : champion;
  });
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
  if (champion) {
    await prisma.battle.update({
      where: { id: battleId },
      data: { championId: champion.id }
    });
  }

  return fightersWithScores;
};
