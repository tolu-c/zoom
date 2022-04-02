require('dotenv').config();
/* eslint-disable max-len */

if (process.env.BROWSER) {
  // throw new Error(
  //   'Do not import `config.js` from inside the client-side code.',
  // );
}

module.exports = {
  // default locale is the first one
  locales: [
    /* @intl-code-template '${lang}-${COUNTRY}', */
    'en-US',
    'es',
    'fr-FR',
    'ru-RU',
    'ja-JP',
    'id-ID',
    'hr-HR',
    'zh-CN',
    'sv-SE'
    /* @intl-code-template-end */
  ],

  // Node.js app
  port: process.env.PORT || 3000,

  // https://expressjs.com/en/guide/behind-proxies.html
  trustProxy: process.env.TRUST_PROXY || 'loopback',

  // SITE URL
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',

  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL ||
      `http://localhost:${process.env.PORT || 3000}`,

    apiEndpoint: process.env.API_ENDPOINT_URL || 'http://localhost:4000',
    socketUrl: process.env.SOCKET_URL || 'http://localhost:4001'
  },

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Maximum upload size
  maxUploadSize: process.env.MAX_UPLOAD_SIZE || 5,

  // Licence Upload
  licenseuploadDir: process.env.LICENSE_UPLOAD_DIR || '/images/license/',

  // Vehicle Upload
  vehicleUploadDir: process.env.VEHICLE_UPLOAD_DIR || '/images/vehicle/',

  // Profile photo upload
  profilePhotouploadDir: process.env.PROFILE_PHOTO_UPLOAD_DIR || '/images/avatar/',

  // category photo upload
  categoryUploadDir: process.env.CATEGORY_PHOTO_UPLOAD_DIR || '/images/category/',

  // Logo photo upload
  logoUploadDir: process.env.LOGO_PHOTO_UPLOAD_DIR || '/images/logo/',

  // homepage photo upload
  homepageUploadDir: process.env.HOMEPAGE_UPLOAD_DIR || '/images/homepage/',

  // staticpage photo upload
  staticpageUploadDir: process.env.STATICPAGE_UPLOAD_DIR || '/images/staticpage/',

  //Content page photo upload
  contentPageUploadDir: process.env.CONTENTPAGE_UPLOAD_DIR || '/images/contentPage/',

  // favicon upload
  faviconUploadDir: process.env.FAVICON_UPLOAD_DIR || '/images/favicon/',

  // Push Notification Server Key
  serverKey: '<Your Firebase Server Key>',

  //Google map api key
  googleMapAPI: process.env.GOOGLE_MAP_API || '<Your Google Map API Key>',
  googleMapServerKey: process.env.GOOGLE_MAP_SERVER_KEY,

  // Web analytics
  analytics: {
    // https://analytics.google.com/
    googleTrackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

  // Payment - Stripe
  payment: { /* From ENV */
    stripe: {
      secretKey: process.env.STRIPE_SECRET,
    }
  },

  // Authentication
  auth: {
    jwt: { secret: process.env.JWT_SECRET },

    // https://developers.facebook.com/
    facebook: {
      id: process.env.FACEBOOK_APP_ID || '186244551745631',
      secret:
        process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc',
    },

    // https://cloud.google.com/console/project
    google: {
      id:
        process.env.GOOGLE_CLIENT_ID ||
        '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
      secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
    },

    // https://apps.twitter.com/
    twitter: {
      key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
      secret:
        process.env.TWITTER_CONSUMER_SECRET ||
        'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
    },
  },
  unitTypes: {
    km: { value: 'metric', convertFromMeter: 1000 },
    mile: { value: 'imperial', convertFromMeter: 1609 }
  },
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNTSID,
      authToken: process.env.TWILIO_AUTHTOKEN,
      phoneNumber: process.env.TWILIO_PHONENUMBER
    }
  },
  //Get near by driver in miles
  distance: 5
};
