


const { Users, CreditHistories } = require("@models");


const CREDIT_RULES = {
  DAILY_LOGIN: 10,
  PROFILE_COMPLETE: 20,
  INTERACTION: 2, 
};



async function adjustCredits(userId, amount, type, reason, t = null) {
  const options = t ? { transaction: t } : {};

  const user = await Users.findByPk(userId, options);
  if (!user) throw new Error("User not found");

  const newBalance = Math.max(0, user.credits + amount);

  await user.update({ credits: newBalance }, options);

  const history = await CreditHistories.create(
    { userId, amount, type, reason },
    options
  );

  return { newBalance, history };
}



async function awardDailyLogin(user) {
  const today = new Date().toISOString().slice(0, 10); 

  if (user.lastLoginDate === today) {
    return { awarded: false };
  }

  await user.update({ lastLoginDate: today });
  const { newBalance } = await adjustCredits(
    user.id,
    CREDIT_RULES.DAILY_LOGIN,
    "earn",
    "Daily login bonus"
  );

  return { awarded: true, newBalance };
}



async function awardProfileComplete(user) {
  if (user.isProfileComplete) return { awarded: false };

  await user.update({ isProfileComplete: true });
  const { newBalance } = await adjustCredits(
    user.id,
    CREDIT_RULES.PROFILE_COMPLETE,
    "earn",
    "Profile completion bonus"
  );

  return { awarded: true, newBalance };
}



async function awardInteraction(userId, action) {
  const { newBalance } = await adjustCredits(
    userId,
    CREDIT_RULES.INTERACTION,
    "earn",
    `Interaction: ${action}`
  );

  return { newBalance };
}

module.exports = {
  adjustCredits,
  awardDailyLogin,
  awardProfileComplete,
  awardInteraction,
  CREDIT_RULES,
};
