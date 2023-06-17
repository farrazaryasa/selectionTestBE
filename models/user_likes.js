'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_likes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_likes.belongsTo(models.users, {
        foreignKey: 'user_id'
      })
      user_likes.belongsTo(models.user_posts, {
        foreignKey: 'post_id'
      })
    }
  }
  user_likes.init({
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'user_likes',
  });
  return user_likes;
};