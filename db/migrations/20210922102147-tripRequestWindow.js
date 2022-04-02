'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkInsert('SiteSettings', [
        {
          title: 'Distance',
          name: 'distance',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Duration',
          name: 'duration',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Estimated Price',
          name: 'estimatedPrice',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Pick-up Location',
          name: 'pickupLocation',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Destination Location',
          name: 'destinationLocation',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Driver Android App',
          name: 'sleepDriverAndroid',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Driver iOS App',
          name: 'sleepDriverios',
          value: '1',
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return true;
  }
};
