'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'siteName';"),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return true;
  }
};
