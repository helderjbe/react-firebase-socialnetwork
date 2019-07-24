import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export const MediaQuerySmUp = props => {
  const { children } = props;

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  return matches ? children : null;
};

export const MediaQueryXsDown = props => {
  const { children } = props;

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));

  return matches ? children : null;
};
