'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('User', 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('User', 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      })
    ])
  }
};
