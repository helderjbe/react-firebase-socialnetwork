export const SEARCH_CONFIG = {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  searchKey: process.env.REACT_APP_ALGOLIA_SEARCH_KEY
};

export const ENV_PREFIX =
  process.env.NODE_ENV === 'production' ? 'prod_' : 'dev_';

const SUFFIX = process.env.NODE_ENV === 'production' ? '_PROD' : '_DEV';
export const APP_CONFIG = {
  apiKey: process.env['REACT_APP_API_KEY' + SUFFIX] || null,
  authDomain: process.env['REACT_APP_AUTH_DOMAIN' + SUFFIX] || null,
  databaseURL: process.env['REACT_APP_DATABASE_URL' + SUFFIX] || null,
  projectId: process.env['REACT_APP_PROJECT_ID' + SUFFIX] || null,
  storageBucket: process.env['REACT_APP_STORAGE_BUCKET' + SUFFIX] || null,
  messagingSenderId:
    process.env['REACT_APP_MESSAGING_SENDER_ID' + SUFFIX] || null,
  appId: process.env['REACT_APP_APP_ID' + SUFFIX] || null,
  measurementId: process.env['REACT_APP_MEASUREMENT_ID' + SUFFIX] || null
};
