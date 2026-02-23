


module.exports = (sequelize, DataTypes) => {
  const SavedPost = sequelize.define("SavedPosts", {
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
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
    source: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: "saved_posts",
    timestamps: true,
    
    indexes: [
      { unique: true, fields: ["userId", "postId"] },
    ],
  });

  SavedPost.associate = (models) => {
    SavedPost.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
  };

  return SavedPost;
};
