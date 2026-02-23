/**
 * Report model
 * Stores user-submitted reports against feed posts.
 */
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define("Reports", {
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
    postId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    // Admin workflow: pending → reviewed | dismissed
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "dismissed"),
      defaultValue: "pending",
    },
  }, {
    tableName: "reports",
    timestamps: true,
  });

  Report.associate = (models) => {
    Report.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
  };

  return Report;
};
