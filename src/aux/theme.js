import lightBlue from '@material-ui/core/colors/lightBlue';
import grey from '@material-ui/core/colors/grey';

export default {
  palette: {
    primary: {
      light: lightBlue[100],
      main: lightBlue[500],
      dark: lightBlue[700],
      contrastText: grey[50]
    },
    secondary: {
      light: '#fff',
      main: grey[50],
      dark: grey[100],
      contrastText: grey[900]
    },
    text: {
      primary: grey[900],
      secondary: grey[500],
      disabled: grey[400],
      hint: grey[200]
    }
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#f9f9f9'
        }
      }
    }
  }
};