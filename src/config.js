export const SEARCH_CONFIG = {
  appId: process.env.REACT_APP_ALGOLIA_APP_ID,
  searchKey: process.env.REACT_APP_ALGOLIA_SEARCH_KEY
};

export const APP_CONFIG = {
  apiKey: process.env['REACT_APP_API_KEY'] || null,
  authDomain: process.env['REACT_APP_AUTH_DOMAIN'] || null,
  databaseURL: process.env['REACT_APP_DATABASE_URL'] || null,
  projectId: process.env['REACT_APP_PROJECT_ID'] || null,
  storageBucket: process.env['REACT_APP_STORAGE_BUCKET'] || null,
  messagingSenderId: process.env['REACT_APP_MESSAGING_SENDER_ID'] || null,
  appId: process.env['REACT_APP_APP_ID'] || null,
  measurementId: process.env['REACT_APP_MEASUREMENT_ID'] || null
};
