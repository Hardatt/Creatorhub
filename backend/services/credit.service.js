/**
 * Credit Service
 * Centralizes all credit mutation logic.
 * Every call records a CreditHistory row and updates the user balance atomically.
 */
const { Users, CreditHistories } = require("@models");

// Credit amounts per action
const CREDIT_RULES = {
  DAILY_LOGIN: 10,
  PROFILE_COMPLETE: 20,
  INTERACTION: 2, // like / save / share / report
};

/**
 * Award or deduct credits from a user.
 *
 * @param {number}  userId
 * @param {number}  amount   - positive = earn, negative = deduct
 * @param {"earn"|"deduct"} type
 * @param {string}  reason   - human-readable label
 * @param {object}  [t]      - optional Sequelize transaction
 * @returns {Promise<{newBalance: number, history: CreditHistories}>}
 */
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

/**
 * Award daily-login bonus (only once per calendar day).
 * @param {object} user - Sequelize User instance
 * @returns {Promise<{awarded: boolean, newBalance?: number}>}
 */
async function awardDailyLogin(user) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

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

/**
 * Award profile-completion bonus (once, permanently).
 * @param {object} user
 */
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

/**
 * Award interaction credit (+2) for like / save / share / report actions.
 * @param {number} userId
 * @param {string} action  - e.g. "save_post", "share_post", "report_post"
 */
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
