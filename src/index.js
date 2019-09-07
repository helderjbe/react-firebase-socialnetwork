import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { InstantSearch, Configure } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';
import { ENV_PREFIX, SEARCH_CONFIG } from './config';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import themeObj from './aux/theme';

import Firebase, { FirebaseContext } from './components/Firebase';

const theme = createMuiTheme(themeObj);

ReactDOM.render(
  <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirebaseContext.Provider value={new Firebase()}>
        <InstantSearch
          indexName={ENV_PREFIX + process.env.REACT_APP_ALGOLIA_INDEX_NAME}
          searchClient={algoliasearch(
            SEARCH_CONFIG.appId,
            SEARCH_CONFIG.searchKey
          )}
        >
          <App />
          <Configure hitsPerPage={9} />
        </InstantSearch>
      </FirebaseContext.Provider>
    </ThemeProvider>
  </>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
