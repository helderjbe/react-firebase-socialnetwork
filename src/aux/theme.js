import cyan from '@material-ui/core/colors/cyan';
import grey from '@material-ui/core/colors/grey';

export default {
  palette: {
    primary: {
      light: cyan[100],
      main: cyan[500],
      dark: cyan[700],
      contrastText: grey[100],
    },
    secondary: {
      light: '#fff',
      main: grey[50],
      dark: grey[100],
      contrastText: grey[800],
    },
    text: {
      primary: grey[800],
      secondary: grey[500],
      disabled: grey[400],
      hint: grey[200],
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#f9f9f9',
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: '8px',
      },
    },
  },
};
