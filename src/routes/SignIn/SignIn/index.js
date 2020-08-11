import React, { useState, useEffect } from 'react';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';
import { withUserSession } from '../../../components/Session';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { LinearProgress, Box, Divider } from '@material-ui/core';

import GoogleLogo from './googleLogo.png';
import FacebookLogo from './facebookLogo.png';

const SignIn = ({ history, api, callSnackbar, authstate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authstate && window.location.hash !== '#redirect' && !redirecting) {
      history.push(ROUTES.HOME);
    }
  }, [authstate, history, redirecting]);

  useEffect(() => {
    if (window.location.hash === '#redirect') {
      setLoading(true);
      setRedirecting(true);
      window.location.hash = '';
    }
  }, []);

  useEffect(() => {
    if (redirecting) {
      api.auth
        .getRedirectResult()
        .then((result) => {
          if (result.credential) {
            history.push(ROUTES.SETTINGS);
          }
        })
        .catch((error) => {
          callSnackbar(error.message, 'error');
          setLoading(false);
        });
    }
  }, [api.auth, callSnackbar, history, redirecting]);

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      await api.doSignInWithEmailAndPassword(email, password);
      history.push(ROUTES.HOME);
    } catch (error) {
      setLoading(false);
      callSnackbar(error.message, 'error');
    }
  };

  const onGoogleSignIn = () => {
    const provider = new api.firebase.auth.GoogleAuthProvider();

    window.location.hash = 'redirect';
    api.doSignInWithRedirect(provider);
  };

  const onFacebookSignIn = () => {
    const provider = new api.firebase.auth.FacebookAuthProvider();

    window.location.hash = 'redirect';
    api.doSignInWithRedirect(provider);
  };

  const isInvalid = password === '' || email === '' || loading;

  return (
    <>
      <Box mb={1.5}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={onGoogleSignIn}
        >
          <img
            src={GoogleLogo}
            alt="Google Logo"
            width={16}
            height={16}
            style={{ marginRight: '8px' }}
          />
          <span style={{ textTransform: 'none' }}>Sign in with Google</span>
        </Button>
      </Box>
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={onFacebookSignIn}
      >
        <img
          src={FacebookLogo}
          alt="Facebook Logo"
          width={16}
          height={16}
          style={{ marginRight: '8px' }}
        />
        <span style={{ textTransform: 'none' }}>Sign in with Facebook</span>
      </Button>
      <Box mt={3} mb={1}>
        <Divider variant="middle" />
      </Box>
      <form onSubmit={onSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoFocus
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          disabled={isInvalid}
          variant="contained"
          color="primary"
          style={{ marginTop: '8px' }}
        >
          Sign In
        </Button>
        {loading && <LinearProgress />}
      </form>
    </>
  );
};

export default withRouter(withFirebase(withUserSession(withSnackbar(SignIn))));
