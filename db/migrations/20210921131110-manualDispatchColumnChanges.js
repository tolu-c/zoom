'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Booking', 'adminId', { type: Sequelize.UUID }),
      queryInterface.addColumn('Booking', 'isTripCancelledByAdmin', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn('User', 'adminId', { type: Sequelize.UUID })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Booking', 'adminId'),
      queryInterface.removeColumn('Booking', 'isTripCancelledByAdmin'),
      queryInterface.removeColumn('User', 'adminId')
    ])
  }
};