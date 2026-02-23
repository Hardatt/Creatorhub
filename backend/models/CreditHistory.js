


module.exports = (sequelize, DataTypes) => {
  const CreditHistory = sequelize.define("CreditHistories", {
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
    
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("earn", "deduct"),
      allowNull: false,
    },
    
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: "credit_histories",
    timestamps: true,
    updatedAt: false,
  });

  CreditHistory.associate = (models) => {
    CreditHistory.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
  };

  return CreditHistory;
};
