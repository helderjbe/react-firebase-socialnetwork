import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../Firebase';

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

import defaultAvatar from '../../../common/images/defaultAvatar.png';
import { withStyles } from '@material-ui/core';

const EditAvatar = withStyles(theme => ({
  root: {
    position: 'absolute',
    bottom: '15%',
    right: '15%',
    width: 20,
    height: 20,
    backgroundColor: theme.palette.primary.light
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
    bio: '',
    location: '',
    contact: '',
    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedImage: null,
    croppedAreaPixels: null,
    imageCropDialog: false,
    error: null
  };

  componentDidMount() {
    const { api, authstate } = this.props;

    api
      .refUserPublicById(authstate.uid)
      .get()
      .then(doc => {
        doc.exists && this.setState({ ...doc.data() });
      })
      .then(() => {
        const { avatar } = this.state;
        if (avatar) {
          return api.refUserPublicAvatar(authstate.uid).getDownloadURL();
        }
      })
      .then(url => {
        url && this.setState({ croppedImage: url });
      });
  }

  onSubmit = async event => {
    event.preventDefault();

    const {
      name,
      avatar,
      bio,
      contact,
      location,
      croppedImage,
      imageSrc
    } = this.state;
    const { api, authstate, history } = this.props;

    if (!!imageSrc) {
      await api
        .refUserPublicAvatar(authstate.uid)
        .putString(croppedImage, 'data_url');
    }

    api
      .refUserPublicById(authstate.uid)
      .set(
        {
          avatar: avatar || !!imageSrc,
          name,
          bio,
          location,
          contact
        },
        { merge: true }
      )
      .then(() => {
        history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  onSelectImage = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const imageDataUrl = await readFile(e.target.files[0]);
      this.setState({
        imageSrc: imageDataUrl
      });
      this.setState({ imageCropDialog: true });
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
      bio,
      location,
      contact,
      imageSrc,
      croppedImage,
      imageCropDialog,
      zoom,
      error
    } = this.state;

    const isInvalid = name === '';

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
          required
          value={name}
          onChange={this.onChange}
          placeholder="John Smith"
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="location"
          label="Location"
          name="location"
          autoComplete="location"
          value={location}
          onChange={this.onChange}
          placeholder="London, UK"
        />
        <Box mt={3} mb={2}>
          <Divider variant="middle" />
        </Box>
        <TextField
          variant="outlined"
          margin="normal"
          multiline
          rows="4"
          fullWidth
          id="bio"
          label="Bio"
          name="bio"
          value={bio}
          placeholder={
            "Fiction enthusiast. There isn't a fiction book I don't know.\n\nMy hobbies include traveling, reading, hiking."
          }
          onChange={this.onChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          multiline
          rows="4"
          fullWidth
          id="contact"
          label="Contact"
          name="contact"
          value={contact}
          onChange={this.onChange}
          placeholder={'Facebook: ...\nTwitter: ...'}
          helperText="Share your social media accounts, e-mails, etc"
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
        <Typography color="error" variant="body2">
          {error && error.message}
        </Typography>
      </form>
    );
  }
}

export default withRouter(withFirebase(UserProfile));
