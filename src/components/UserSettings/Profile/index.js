import React, { Component } from 'react';

import makeCancelable from 'makecancelable';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../Firebase';
import { withSnackbar } from '../../Snackbar';

import Cropper from 'react-easy-crop';
import getCroppedImg, { readFile } from '../../../aux/imageUtils';

import * as ROUTES from '../../../constants/routes';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import Edit from '@material-ui/icons/Edit';

import defaultAvatar from '../../../common/images/defaultAvatar.jpg';
import { withStyles, LinearProgress } from '@material-ui/core';

const EditAvatar = withStyles(theme => ({
  root: {
    position: 'absolute',
    bottom: '15%',
    right: '15%',
    width: 20,
    height: 20,
    backgroundColor: theme.palette.primary.main
  }
}))(Avatar);

const ImageEditor = withStyles(theme => ({
  paper: {
    margin: 0,
    flexGrow: 1
  }
}))(Dialog);

class UserProfile extends Component {
  state = {
    avatar: false,
    name: '',
    about: '',
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedImage: null,
    croppedAreaPixels: null,
    imageCropDialog: false,
    loading: false
  };

  componentDidMount() {
    const { api, authstate, callSnackbar } = this.props;

    this.cancelRequest = makeCancelable(
      api.refUserById(authstate.uid).get(),
      doc => {
        const docData = doc.data();
        doc.exists && this.setState({ ...docData });
        if (doc.exists && docData.avatar) {
          this.cancelRequest2 = makeCancelable(
            api.refUserAvatar(authstate.uid).getDownloadURL(),
            url => url && this.setState({ croppedImage: url })
          );
        }
      },
      error => callSnackbar(error.message, 'error')
    );
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }

    if (this.cancelRequest2) {
      this.cancelRequest2();
    }
  }

  onSubmit = async event => {
    event.preventDefault();

    const { name, avatar, about, croppedImage, imageSrc } = this.state;
    const { api, authstate, history, callSnackbar } = this.props;

    await this.setState({ loading: true });

    try {
      if (!!imageSrc) {
        await api
          .refUserAvatar(authstate.uid)
          .putString(croppedImage, 'data_url');
      }

      await api.refUserById(authstate.uid).set(
        {
          avatar: avatar || !!imageSrc,
          name,
          about
        },
        { merge: true }
      );
      callSnackbar('Profile updated successfully', 'success');
      history.push(ROUTES.HOME);
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  onSelectImage = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const imageDataUrl = await readFile(e.target.files[0]);
      this.setState({
        imageSrc: imageDataUrl,
        imageCropDialog: true
      });
    }
  };

  onImgError = () => {
    this.setState({ imageCropDialog: false });
  };

  onCropChange = crop => {
    this.setState({ crop });
  };

  onCropComplete = (_croppedArea, croppedAreaPixels) => {
    this.setState({ croppedAreaPixels });
  };

  onZoomChange = zoom => {
    this.setState({ zoom });
  };

  completeCrop = async () => {
    const croppedImage = await getCroppedImg(
      this.state.imageSrc,
      this.state.croppedAreaPixels,
      200,
      200
    );
    this.setState({ croppedImage });
  };

  handleImageCropDialogClose = () => {
    this.completeCrop();
    this.setState({ imageCropDialog: false });
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      name,
      about,
      imageSrc,
      croppedImage,
      imageCropDialog,
      zoom,
      loading
    } = this.state;

    const isInvalid = (name === '' && about === '' && !croppedImage) || loading;

    return (
      <form onSubmit={this.onSubmit}>
        <Box display="flex" justifyContent="center">
          <input
            onChange={this.onSelectImage}
            accept="image/*"
            hidden
            id="selectedImage"
            type="file"
          />
          <label htmlFor="selectedImage">
            <IconButton style={{ position: 'relative' }} component="span">
              <Avatar
                alt="Profile picture"
                src={croppedImage || defaultAvatar}
                style={{ width: 110, height: 110 }}
              />
              <EditAvatar>
                <Edit style={{ width: 14, height: 14 }} />
              </EditAvatar>
            </IconButton>
          </label>
        </Box>
        <ImageEditor
          maxWidth="sm"
          open={imageCropDialog}
          onClose={this.handleImageCropDialogClose}
          aria-label="Image Crop Dialog"
        >
          {imageSrc && (
            <>
              <Box
                position="relative"
                width="100%"
                height="50vh"
                maxHeight="600px"
              >
                <Cropper
                  image={this.state.imageSrc}
                  crop={this.state.crop}
                  zoom={this.state.zoom}
                  onImgError={this.onImgError}
                  aspect={1}
                  cropShape="round"
                  onCropChange={this.onCropChange}
                  onCropComplete={this.onCropComplete}
                  onZoomChange={this.onZoomChange}
                  maxZoom={4}
                />
              </Box>
              <Box mx={3} mt={1}>
                <Slider
                  value={zoom}
                  min={1}
                  max={4}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(_e, zoom) => this.onZoomChange(zoom)}
                />
              </Box>
            </>
          )}
          <Button
            type="submit"
            onClick={this.handleImageCropDialogClose}
            variant="contained"
            fullWidth
            color="primary"
            style={{ display: 'block', borderRadius: 0 }}
          >
            Close
          </Button>
        </ImageEditor>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="name"
          label="Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={this.onChange}
          placeholder="John Smith"
        />
        <TextField
          variant="outlined"
          margin="normal"
          multiline
          rows="5"
          rowsMax="15"
          fullWidth
          id="about"
          label="About Me"
          name="about"
          value={about}
          placeholder={
            'From London.\n\nMy hobbies include traveling, reading, hiking.\n\nFacebook: johnsmith, Instagram: @johnsmith'
          }
          onChange={this.onChange}
        />
        <Button
          type="submit"
          fullWidth
          disabled={isInvalid}
          variant="contained"
          color="primary"
          style={{ marginTop: '8px' }}
        >
          Update
        </Button>
        {loading && <LinearProgress />}
      </form>
    );
  }
}

export default withRouter(withFirebase(withSnackbar(UserProfile)));
