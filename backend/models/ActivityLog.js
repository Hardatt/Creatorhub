


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
    
    action: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    
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
