'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'token_counter', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'token_counter')
  }
};
