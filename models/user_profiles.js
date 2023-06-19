'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_profiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_profiles.belongsTo(models.users, {
        foreignKey: 'user_id'
      })
    }
  }
  user_profiles.init({
    user_id: DataTypes.INTEGER,
    bio: DataTypes.STRING,
    profile_picture: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user_profiles',
  });
  return user_profiles;
};