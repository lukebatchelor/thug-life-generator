import React from 'react';
import { fabric } from './gif/fabric3.min.js';
console.log(fabric);

const urlParams = new URLSearchParams(window.location.search);
const maxSizeParam = urlParams.get('max');

const MAX_IMAGE_DIMENSION = maxSizeParam ? parseInt(maxSizeParam) : 500;

const ImageWithBorder = fabric.util.createClass(fabric.Image, {
  type: 'ImageWithBorder',
  _render: function(ctx) {
    this.callSuper('_render', ctx);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 10;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
  }
});

// We need to set a max size of the outputted image for a couple of reasons:
// 1. It makes moving homer on the image super annoying because of the sheer
//    number of pixels (especially is screen shots from high dpi screens)
// 2. Outputting takes ages (and results in a massive gif)
// 3. Scaling homer to _fit_ on a massive image makes him look terrible
// So we set a max size and scale the src image based on that
function getCalculatedImageHeight(uploadedImg) {
  const { height, width } = uploadedImg;
  if (height < MAX_IMAGE_DIMENSION && width < MAX_IMAGE_DIMENSION) {
    return { imgHeight: height, imgWidth: width };
  }

  const xScaling = width > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / width : 1;
  const yScaling = height > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / height : 1;
  // We want to scale both dimensions evenly, so take the biggest scaling factor
  const maxScaling = Math.min(xScaling, yScaling);
  const newWidth = Math.round(width * maxScaling);
  const newHeight = Math.round(height * maxScaling);

  return { imgWidth: newWidth, imgHeight: newHeight };
}

export default class DecoratingScreen extends React.Component {
  canvasRef = React.createRef();
  fabricCanvas = null;

  componentDidMount() {
    const { uploadedImg } = this.props;
    const { width: realWidth, height: realHeight } = uploadedImg;
    const { imgWidth, imgHeight } = getCalculatedImageHeight(uploadedImg);
    const scaleX = imgWidth / realWidth;
    const scaleY = imgHeight / realHeight;
    const fabricCanvas = new fabric.Canvas('decoratingCanvas', { height: imgHeight, width: imgWidth });
    this.fabricCanvas = fabricCanvas;
    const ctx = fabricCanvas.getContext();

    const fabricBackgroundImg = new fabric.Image(uploadedImg, {
      scaleX,
      scaleY,
      lockMovementX: true,
      lockMovementY: true,
      selectable: false,
      hoverCursor: 'default'
    });
    fabricCanvas.add(fabricBackgroundImg);

    fabric.util.loadImage('/glasses.png', glassesImg => {
      const { width: glassesWidth, height: glassesHeight } = glassesImg;
      const expectedWidth = imgWidth / 4;
      const expectedHeight = imgHeight / 10;
      const scaleX = expectedWidth / glassesWidth;
      const scaleY = expectedHeight / glassesHeight;
      const defaultX = imgWidth / 3 + expectedWidth / 2;
      const defaultY = imgHeight / 5 + expectedHeight / 2;

      const fabricGlassesImg = new ImageWithBorder(glassesImg, {
        scaleX,
        scaleY,
        top: defaultY,
        left: defaultX,
        borderColor: 'red',
        cornerColor: 'red'
      });
      fabricCanvas.add(fabricGlassesImg);
    });

    fabric.util.loadImage('/joint.png', jointImg => {
      const { width: jointWidth, height: jointHeight } = jointImg;
      const expectedWidth = imgWidth / 4;
      const expectedHeight = imgHeight / 10;
      const scaleX = expectedWidth / jointWidth;
      const scaleY = expectedHeight / jointHeight;
      const defaultX = imgWidth / 3 + expectedWidth / 2;
      const defaultY = (imgHeight / 5) * 3 + expectedHeight / 2;

      const fabricJointImg = new ImageWithBorder(jointImg, {
        scaleX,
        scaleY,
        top: defaultY,
        left: defaultX,
        borderColor: 'red',
        cornerColor: 'red'
      });
      fabricCanvas.add(fabricJointImg);
    });

    fabric.util.loadImage('/text.png', textImg => {
      const { width: textWidth, height: textHeight } = textImg;
      const expectedWidth = imgWidth / 4;
      const expectedHeight = imgHeight / 10;
      const scaleX = expectedWidth / textWidth;
      const scaleY = expectedHeight / textHeight;
      const defaultX = imgWidth / 3 + expectedWidth / 2;
      const defaultY = (imgHeight / 5) * 3 + expectedHeight / 2;

      const fabricTextImg = new ImageWithBorder(textImg, {
        scaleX,
        scaleY,
        top: defaultY,
        left: defaultX,
        borderColor: 'red',
        cornerColor: 'red'
      });
      fabricCanvas.add(fabricTextImg);
    });
  }

  render() {
    return (
      <div>
        <p>Great! Now position your props!</p>
        <canvas ref={this.canvasRef} className="decoratingCanvas" id="decoratingCanvas"></canvas>
        <div style={{ marginTop: '30px' }}>
          <button type="button" className="upload-button" onClick={this.onReadyClicked}>
            Ready!
          </button>
        </div>
      </div>
    );
  }
}
