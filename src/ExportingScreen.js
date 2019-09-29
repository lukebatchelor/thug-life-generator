import React from 'react';
import gifExporter from './gif/gifExporter';
import fileSaver from 'file-saver';

export default class ExportingScreen extends React.Component {
  static defaultProps = {
    onStartAgainClicked: () => {},
    uploadedImg: null,
    gifController: null,
    imgXOffset: 0,
    imgYOffset: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    homerHeight: 0,
    homerWidth: 0
  };

  state = {
    completionPercentage: 0,
    base64encodedImg: null,
    imgSizeMb: 0
  };

  componentDidMount() {
    const {
      uploadedImg,
      gifController,
      imgXOffset,
      imgYOffset,
      canvasWidth,
      canvasHeight,
      homerHeight,
      homerWidth
    } = this.props;
    const numFrames = gifController.get_length();
    const gifCanvas = gifController.get_canvas();
    const gif = new gifExporter({
      workerPath: 'js/Animated_GIF.worker.min.js'
    });
    gif.setSize(canvasWidth, canvasHeight);
    gif.setDelay(100);
    gifController.pause();
    gif.onRenderProgress(progress => {
      const completionPercentage = (progress * 100).toFixed(2);
      this.setState({ completionPercentage });
    });

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.height = canvasHeight;
    tempCanvas.width = canvasWidth;

    for (let i = 0; i < numFrames; i++) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      gifController.move_to(i);
      ctx.drawImage(uploadedImg, 0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(gifCanvas, imgXOffset, imgYOffset, homerWidth, homerHeight);
      gif.addFrameImageData(ctx.getImageData(0, 0, canvasWidth, canvasHeight));
    }

    gif.getBase64GIF(base64encodedImg => {
      // need to also get image as a blob for use in downloading (and giving us an accurate size)
      // Cool hack to convert b64string to blob!
      fetch(base64encodedImg)
        .then(res => res.blob())
        .then(imgBlob => {
          const imgSizeMb = (imgBlob.size / 1000000).toFixed(2);
          this.setState({ base64encodedImg, imgSizeMb, imgBlob });
        });
    });
  }

  onDownloadClicked = () => {
    const { imgBlob } = this.state;
    // Turns out saving files in a cross browser way is a PITA - fileSaver makes
    // this so much easier <3
    fileSaver.saveAs(imgBlob, 'homer.gif');
  };

  render() {
    const { base64encodedImg, imgSizeMb } = this.state;
    return (
      <div>
        {!base64encodedImg && <p>Exporting: {this.state.completionPercentage}%</p>}
        {base64encodedImg && (
          <div>
            <p>Done!</p>
            <img src={base64encodedImg} alt="Disappearing Homer" style={{ width: '80%' }}></img>
            <p>Size: {imgSizeMb}Mb</p>
            <button type="button" className="upload-button" onClick={this.onDownloadClicked}>
              Download!
            </button>
            <button type="button" className="upload-button" onClick={this.props.onStartAgainClicked}>
              Start Again
            </button>
          </div>
        )}
      </div>
    );
  }
}
