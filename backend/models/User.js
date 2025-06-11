module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("Users", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    credits: {
      type: DataTypes.Integer,
      defaultValue: 0,
    },
  });
  return User;
};
