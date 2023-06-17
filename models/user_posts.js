'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_posts.belongsTo(models.users, {
        foreignKey: 'user_id'
      })
      user_posts.hasMany(models.user_likes, {
        foreignKey: 'post_id'
      })
    }
  }
  user_posts.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true
    },
    post_image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'user_posts',
  });
  return user_posts;
};