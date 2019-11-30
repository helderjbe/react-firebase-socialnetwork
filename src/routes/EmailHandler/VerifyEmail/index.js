import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { withRouter, Link as RouterLink } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';

import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

const VerifyEmail = ({ api, actionCode, history, authstate }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.auth.applyActionCode(actionCode);

        setSuccess(true);
      } catch (error) {
        setError(error);
      }
    };
    verifyEmail();
  }, [actionCode, api, history]);

  return (
    <>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Verify Email
      </Typography>
      {!error && !success && (
        <Box width="100%" textAlign="center" my={2} key={0}>
          <CircularProgress />
        </Box>
      )}
      {success && (
        <>
          <Typography>Your email has been successfully verified.</Typography>
          <Link component={RouterLink} to={ROUTES.HOME} color="primary">
            You may now return to the home page by clicking on this link.
          </Link>
        </>
      )}
      {error && <Typography color="error">{error.message}</Typography>}
    </>
  );
};

VerifyEmail.propTypes = {
  api: PropTypes.func.isRequired,
  actionCode: PropTypes.string,
  history: PropTypes.object.isRequired
};

export default withRouter(withFirebase(VerifyEmail));
