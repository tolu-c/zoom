'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkInsert('SiteSettings', [
        {
          title: 'Contact Phone Number',
          name: 'contactPhoneNumber',
          value: null,
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Contact Email',
          name: 'contactEmail',
          value: null,
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Skype',
          name: 'skype',
          value: null,
          type: 'appSettings',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return true;
  }
};
