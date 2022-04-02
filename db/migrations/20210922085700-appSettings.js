'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query("update SiteSettings set type = 'appSettings' where name = 'preferredDistanceType';      "),
      queryInterface.sequelize.query("update SiteSettings set type = 'appSettings' where name = 'stripePublishableKey';      "),
      queryInterface.sequelize.query("update SiteSettings set type = 'appSettings' where name = 'multipleStopsWaitingTime';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'siteName';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'logoWidth';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'logoHeight';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'siteTitle';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'metaDescription';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'facebookLink';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'twitterLink';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'youtubeLink';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'instagramLink';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'metaKeyword';"),
      queryInterface.sequelize.query("update SiteSettings set type = 'site_settings' where name = 'homeLogo';"),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return true;
  }
};
