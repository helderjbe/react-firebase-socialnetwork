import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import StickyBox from 'react-sticky-box';

export default class SideBar extends Component {
  static propTypes = {};

  render() {
    return (
      <StickyBox offsetTop={80} offsetBottom={20}>
        <Card style={{ marginBottom: '16px' }}>
          <CardContent color="primary">
            <Typography paragraph align="center">
              Yep, I'm here. Sidebar. Login info, admin, members online, tag
              cloud, etc, mainly etc
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent color="primary">
            <Typography paragraph align="center">
              Yep, I'm here. Sidebar. Login info, admin, members online, tag
              cloud, etc, mainly etc
            </Typography>
          </CardContent>
        </Card>
      </StickyBox>
    );
  }
}
