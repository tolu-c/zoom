'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkInsert('SiteSettings', [{
        title: 'Preferred Distance Type',
        name: 'preferredDistanceType',
        value: 'km',
        type: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }]),
      queryInterface.bulkInsert('SiteSettings', [{
        title: 'Multiple Stops Waiting Time',
        name: 'multipleStopsWaitingTime',
        value: '1',
        type: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }]),
      queryInterface.addColumn('Booking', 'isMultipleStops', {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
      }),
      queryInterface.addColumn('Booking', 'multipleStopsCount', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }),
      queryInterface.addColumn('Booking', 'distanceType', {
        type: Sequelize.ENUM('mile', 'km'),
        defaultValue: 'mile'
      }),
      queryInterface.addColumn('Booking', 'allowedWaitingTime', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkDelete('SiteSettings', {
        name: {
          $in: ['preferredDistanceType']
        }
      }),
      queryInterface.bulkDelete('SiteSettings', {
        name: {
          $in: ['multipleStopsWaitingTime']
        }
      }),
      queryInterface.removeColumn('Booking', 'isMultipleStops'),
      queryInterface.removeColumn('Booking', 'multipleStopsCount'),
      queryInterface.removeColumn('Booking', 'distanceType'),
      queryInterface.removeColumn('Booking', 'allowedWaitingTime'),
    ])
  }
};
