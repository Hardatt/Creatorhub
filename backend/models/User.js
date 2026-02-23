


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    
    isProfileComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    
    lastLoginDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: "users",
    timestamps: true,
  });

  
  User.associate = (models) => {
    User.hasMany(models.CreditHistories, { foreignKey: "userId", as: "creditHistory" });
    User.hasMany(models.SavedPosts, { foreignKey: "userId", as: "savedPosts" });
    User.hasMany(models.Reports, { foreignKey: "userId", as: "reports" });
    User.hasMany(models.ActivityLogs, { foreignKey: "userId", as: "activityLogs" });
  };

  return User;
};
