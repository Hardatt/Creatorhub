/**
 * ActivityLog model
 * Audit trail of all user actions on the platform.
 */
module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define("ActivityLogs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    // e.g. 'login', 'save_post', 'share_post', 'report_post', 'profile_update'
    action: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    // Arbitrary JSON blob for context (post title, source, etc.)
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: "activity_logs",
    timestamps: true,
    updatedAt: false,
  });

  ActivityLog.associate = (models) => {
    ActivityLog.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
  };

  return ActivityLog;
};
