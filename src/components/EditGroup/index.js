import React, { Component } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import Cropper from 'react-easy-crop';
import getCroppedImg, { readFile } from '../../aux/imageUtils';
import ChipInput from 'material-ui-chip-input';

import * as ROUTES from '../../constants/routes';

import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ButtonBase from '@material-ui/core/ButtonBase';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import Edit from '@material-ui/icons/Edit';
import { withStyles } from '@material-ui/core';

import defaultBanner from '../../common/images/defaultBanner.jpg';

const EditAvatar = withStyles(theme => ({
  root: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    width: 30,
    height: 30,
    backgroundColor: theme.palette.secondary.light
  }
}))(Avatar);

const ImageEditor = withStyles(theme => ({
  paper: {
    margin: 0,
    flexGrow: 1
  }
}))(Dialog);

class EditGroup extends Component {
  state = {
    banner: false,
    title: '',
    details: '',
    questions: ['', '', ''],
    limit: 0,
    tags: [],

    imageSrc: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedImage: null,
    croppedAreaPixels: null,
    imageCropDialog: false,

    error: null
  };

  componentDidMount() {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    this.cancelRequest = makeCancelable(
      api.refGroupById(gid).get(),
      doc => {
        const docData = doc.data();
        doc.exists && this.setState({ ...docData });
        if (docData.banner) {
          this.cancelRequest2 = makeCancelable(
            api.refGroupBanner(gid).getDownloadURL(),
            url => {
              url && this.setState({ croppedImage: url });
            },
            error => this.setState({ error })
          );
        }
      },
      error => this.setState({ error })
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

    const {
      banner,
      title,
      details,
      limit,
      tags,
      questions,
      croppedImage,
      imageSrc
    } = this.state;
    const {
      api,
      history,
      match: {
        params: { gid }
      }
    } = this.props;

    if (!!imageSrc) {
      await api
        .refGroupBanner(gid)
        .putString(croppedImage, 'data_url')
        .catch(error => {
          this.setState({
            error: {
              message:
                'No sufficient permissions to update the banner. If recent changes have happened to the group, please allow a few more seconds before updating again.'
            }
          });
        });
    }

    api
      .refGroupById(gid)
      .update({
        banner: banner || !!imageSrc,
        title,
        details,
        limit: Number(limit) === 1 ? 2 : Number(limit),
        tags,
        questions
      })
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
      730,
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

  onChangeQuestions = event => {
    const questionNumber = event.target.name.match(/\d+/)[0];
    const value = event.target.value;
    this.setState(state => {
      const questions = [...state.questions];
      questions[questionNumber] = value;

      return { questions };
    });
  };

  onTagBeforeAdd = chip => {
    const { tags } = this.state;
    return chip.length >= 3 && chip.length <= 20 && tags.length <= 10;
  };

  onTagAdd = chip => {
    const { tags } = this.state;
    this.setState({
      tags: [...tags, chip]
    });
  };

  onTagDelete = deletedChip => {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter(c => c !== deletedChip)
    });
  };

  render() {
    const {
      title,
      details,
      limit,
      memberCount,
      tags,
      questions,
      zoom,
      imageSrc,
      croppedImage,
      imageCropDialog,
      error
    } = this.state;

    const isInvalid = title.length < 6;

    return (
      <form autoComplete="off" onSubmit={this.onSubmit}>
        <Box display="flex" justifyContent="center">
          <input
            onChange={this.onSelectImage}
            accept="image/*"
            hidden
            id="imageSrc"
            type="file"
          />
          <label htmlFor="imageSrc" style={{ width: '100%' }}>
            <Box my={1} style={{ width: '100%' }}>
              <ButtonBase
                style={{ position: 'relative', width: '100%' }}
                component="span"
              >
                <img
                  alt="Group banner"
                  src={croppedImage || defaultBanner}
                  style={{ width: '100%', height: 'auto' }}
                />
                <EditAvatar>
                  <Edit style={{ width: 20, height: 20 }} color="primary" />
                </EditAvatar>
              </ButtonBase>
            </Box>
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
                  aspect={73 / 20}
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
            Crop
          </Button>
        </ImageEditor>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Title"
          name="title"
          placeholder="Freelance accountability group ..."
          required
          value={title}
          inputProps={{ maxLength: '54' }}
          onChange={this.onChange}
        />
        <ChipInput
          fullWidth
          label="Tags"
          value={tags}
          variant="outlined"
          newChipKeyCodes={[13, 9, 188]}
          margin="normal"
          placeholder="Freelance,Beginner,Accountability, ..."
          onBeforeAdd={this.onTagBeforeAdd}
          onAdd={this.onTagAdd}
          onDelete={this.onTagDelete}
        />
        <TextField
          type="number"
          variant="outlined"
          margin="normal"
          fullWidth
          label="Member limit"
          name="limit"
          value={limit}
          onChange={this.onChange}
          inputProps={{ min: 0 }}
          helperText="0 = Unlimited"
        />
        <Box mt={3} mb={2}>
          <Divider variant="middle" />
        </Box>
        <TextField
          variant="outlined"
          margin="normal"
          multiline
          rows="9"
          fullWidth
          label="Details"
          name="details"
          placeholder={
            "Looking for a group that helps me keep focus on my freelancing path.\nJoin if you're also beginning your freelance career.\n..."
          }
          value={details}
          onChange={this.onChange}
        />
        <Box mt={3} mb={2}>
          <Divider variant="middle" />
        </Box>
        <Typography variant="subtitle1" color="textSecondary">
          Joining questions
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Shown before a user joins your group
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Question 1"
          name="questions0"
          placeholder={"What's your freelance level?"}
          value={questions[0]}
          onChange={this.onChangeQuestions}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Question 2"
          name="questions1"
          placeholder={'How active can you be?'}
          value={questions[1]}
          onChange={this.onChangeQuestions}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Question 3"
          name="questions2"
          value={questions[2]}
          onChange={this.onChangeQuestions}
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

EditGroup.propTypes = {
  api: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  })
};

export default withRouter(withFirebase(EditGroup));
