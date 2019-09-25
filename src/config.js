export const SEARCH_CONFIG = {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  searchKey: process.env.REACT_APP_ALGOLIA_SEARCH_KEY
};

export const ENV_PREFIX = process.env.REACT_APP_PROJECT_ID.includes('prod')
  ? 'prod_'
  : 'dev_';

export const APP_CONFIG = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET
};
