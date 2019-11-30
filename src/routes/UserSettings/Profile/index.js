import React, { Component, useState, useEffect } from 'react';

import makeCancelable from 'makecancelable';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';

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

const UserProfile = ({ api, authstate, callSnackbar, history }) => {
  const [avatar, setAvatar] = useState(false);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageCropDialog, setImageCropDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelRequest2 = null;
    const cancelRequest = makeCancelable(
      api.refUserById(authstate.uid).get(),
      doc => {
        const docData = doc.data();
        if (doc.exists) {
          if (docData.avatar) {
            setAvatar(docData.avatar);
            cancelRequest2 = makeCancelable(
              api.refUserAvatar(authstate.uid).getDownloadURL(),
              url => url && setCroppedImage(url)
            );
          }
          docData.name && setName(docData.name);
          docData.about && setAbout(docData.about);
        }
      },
      error => callSnackbar(error.message, 'error')
    );

    return () => {
      cancelRequest();

      if (cancelRequest2) {
        cancelRequest2();
      }
    };
  }, [api, authstate.uid, callSnackbar]);

  const onSubmit = async event => {
    event.preventDefault();

    setLoading(true);

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
      setLoading(false);
      callSnackbar(error.message, 'error');
    }
  };

  const onSelectImage = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const imageDataUrl = await readFile(e.target.files[0]);

      setImageSrc(imageDataUrl);
      setImageCropDialog(true);
    }
  };

  const onImgError = () => setImageCropDialog(false);

  const completeCrop = async () => {
    const updatedCroppedImage = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      200,
      200
    );
    setCroppedImage(updatedCroppedImage);
  };

  const handleImageCropDialogClose = () => {
    completeCrop();
    setImageCropDialog(false);
  };

  const isInvalid = (name === '' && about === '' && !croppedImage) || loading;

  return (
    <form onSubmit={onSubmit}>
      <Box display="flex" justifyContent="center">
        <input
          onChange={onSelectImage}
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
        onClose={handleImageCropDialogClose}
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
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                onImgError={onImgError}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={(_croppedArea, croppedAreaPixels) =>
                  setCroppedAreaPixels(croppedAreaPixels)
                }
                onZoomChange={setZoom}
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
                onChange={(_e, zoom) => setZoom(zoom)}
              />
            </Box>
          </>
        )}
        <Button
          type="submit"
          onClick={handleImageCropDialogClose}
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
        onChange={event => setName(event.target.value)}
        placeholder="John Smith"
        inputProps={{ maxLength: '24' }}
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
        inputProps={{ maxLength: '2000' }}
        placeholder={
          'From London.\n\nMy hobbies include traveling, reading, hiking.\n\nFacebook: johnsmith, Instagram: @johnsmith'
        }
        onChange={event => setAbout(event.target.value)}
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
};

export default withRouter(withFirebase(withSnackbar(UserProfile)));
