'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Booking', 'cancelledByAdminId', { type: Sequelize.UUID }),
      queryInterface.addColumn('BookingHistory', 'cancelledByAdminId', { type: Sequelize.UUID }),
      queryInterface.addColumn('ScheduleBookingHistory', 'cancelledByAdminId', { type: Sequelize.UUID })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Booking', 'cancelledByAdminId'),
      queryInterface.removeColumn('BookingHistory', 'cancelledByAdminId'),
      queryInterface.removeColumn('ScheduleBookingHistory', 'cancelledByAdminId')
    ])
  }
};