'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query("ALTER TABLE BookingLocations MODIFY location varchar(255) CHARACTER SET utf8mb4;"),
      queryInterface.sequelize.query("ALTER TABLE BookingLocations MODIFY previousLocation text CHARACTER SET utf8mb4;")
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query("ALTER TABLE BookingLocations MODIFY location varchar(255) CHARACTER SET latin1;"),
      queryInterface.sequelize.query("ALTER TABLE BookingLocations MODIFY previousLocation text CHARACTER SET latin1;")
    ])
  }
};