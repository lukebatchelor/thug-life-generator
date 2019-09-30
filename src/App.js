import React from 'react';

import UploadScreen from './UploadScreen';
import DecoratingScreen from './DecoratingScreen';
import ExportingScreen from './ExportingScreen';
import './App.css';

import fontFaceObserver from './gif/fontFaceObserver.js';

const urlParams = new URLSearchParams(window.location.search);

const SKIP_UPLOAD_STEP = urlParams.has('debug');

export default class App extends React.Component {
  state = {
    curScreen: 'UPLOAD',
    uploadedImg: null,
    canvasWidth: 0,
    canvasHeight: 0,
    customFontLoaded: false
  };

  componentDidMount() {
    // Hack to hide mobile adress bars
    window.scrollTo(0, 1);

    // USE THIS TO SKIP UPLOADING IMAGE DURING TESTING
    if (SKIP_UPLOAD_STEP) {
      const img = new Image();
      img.onload = () => {
        this.setState({
          curScreen: 'DECORATING',
          uploadedImg: img
        });
      };
      img.src = '/selfie.jpg';
    }

    new fontFaceObserver('Germanica').load().then(a => {
      this.setState({ customFontLoaded: true });
    });
  }

  onImageUploaded = img => {
    this.setState({
      curScreen: 'DECORATING',
      uploadedImg: img
    });
  };

  onResizeReady = ({ imgXOffset, imgYOffset, canvasWidth, canvasHeight, homerHeight, homerWidth }) => {
    this.setState({
      curScreen: 'EXPORTING',
      imgXOffset,
      imgYOffset,
      canvasWidth,
      canvasHeight,
      homerHeight,
      homerWidth
    });
  };

  onStartAgainClicked = () => {
    this.setState({ curScreen: 'UPLOAD', uploadedImg: null });
  };

  onDecorateReady = json => {
    console.log(json);
  };

  render() {
    const { curScreen, uploadedImg, canvasWidth, canvasHeight, customFontLoaded } = this.state;

    return (
      <div className="app">
        <div className="content">
          {curScreen === 'UPLOAD' && <UploadScreen onImageUploaded={this.onImageUploaded} />}
          {customFontLoaded && curScreen === 'DECORATING' && (
            <DecoratingScreen uploadedImg={uploadedImg} onReadyClicked={this.onDecorateReady} />
          )}
          {customFontLoaded && curScreen === 'EXPORTING' && (
            <ExportingScreen
              uploadedImg={uploadedImg}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onStartAgainClicked={this.onStartAgainClicked}
            />
          )}
        </div>
      </div>
    );
  }
}
