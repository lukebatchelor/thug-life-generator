import React from 'react';

import { fabric } from './gif/fabric2.min.js';

const urlParams = new URLSearchParams(window.location.search);
const maxSizeParam = urlParams.get('max');

const MAX_IMAGE_DIMENSION = maxSizeParam ? parseInt(maxSizeParam) : 500;

// const ImageWithBorder = fabric.util.createClass(fabric.Image, {
//   type: 'ImageWithBorder',

//   _render: function(ctx) {
//     this.callSuper('_render', ctx);
//     ctx.strokeStyle = '#FF0000';
//     ctx.lineWidth = 10;
//     ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
//   }
// });

// Pass in an img and a max size, returns the new height and width of that img
// such that neither dimension exceeds maxSize, but the image keeps the same
// ratio.
function getClampedHeightAndWidth(img, maxSize) {
  const { height, width } = img;
  if (height < maxSize && width < maxSize) {
    return { newHeight: height, newWidth: width };
  }

  const xScaling = width > maxSize ? maxSize / width : 1;
  const yScaling = height > maxSize ? maxSize / height : 1;
  // We want to scale both dimensions evenly, so take the biggest scaling factor
  const maxScaling = Math.min(xScaling, yScaling);
  const newWidth = Math.round(width * maxScaling);
  const newHeight = Math.round(height * maxScaling);

  return { newWidth, newHeight };
}

export default class DecoratingScreen extends React.Component {
  canvasRef = React.createRef();
  fabricCanvas = null;

  componentDidMount() {
    const { uploadedImg } = this.props;
    const { width: realWidth, height: realHeight } = uploadedImg;
    const { newWidth: imgWidth, newHeight: imgHeight } = getClampedHeightAndWidth(uploadedImg, MAX_IMAGE_DIMENSION);

    const fabricCanvas = new fabric.Canvas('decoratingCanvas', { height: imgHeight, width: imgWidth });
    this.fabricCanvas = fabricCanvas;

    const scaleX = imgWidth / realWidth;
    const scaleY = imgHeight / realHeight;
    const fabricBackgroundImg = new fabric.Image(uploadedImg, {
      scaleX,
      scaleY,
      lockMovementX: true,
      lockMovementY: true,
      selectable: false,
      hoverCursor: 'default',
      name: 'background'
    });
    fabricCanvas.add(fabricBackgroundImg);

    fabric.util.loadImage('/glasses.png', glassesImg => {
      const { width: glassesRealWidth, height: glassesRealHeight } = glassesImg;
      const { newWidth: glassesNewWidth, newHeight: glassesNewHeight } = getClampedHeightAndWidth(
        glassesImg,
        MAX_IMAGE_DIMENSION / 3 // glasses image should be about 1 / 3 size of background
      );

      const scaleX = glassesNewWidth / glassesRealWidth;
      const scaleY = glassesNewHeight / glassesRealHeight;
      const defaultX = imgWidth / 2;
      const defaultY = imgHeight / 3;

      const fabricGlassesImg = new fabric.Image(glassesImg, {
        scaleX,
        scaleY,
        top: defaultY,
        left: defaultX,
        borderColor: 'red',
        cornerColor: 'red',
        originX: 'center',
        originY: 'center',
        name: 'glasses'
      });
      fabricCanvas.add(fabricGlassesImg);
    });

    fabric.util.loadImage('/joint.png', jointImg => {
      const { width: jointRealWidth, height: jointRealHeight } = jointImg;
      const { newWidth: jointNewWidth, newHeight: jointNewHeight } = getClampedHeightAndWidth(
        jointImg,
        MAX_IMAGE_DIMENSION / 4 // joint image should be about 1 / 4 size of background
      );
      const scaleX = jointNewWidth / jointRealWidth;
      const scaleY = jointNewHeight / jointRealHeight;
      const defaultX = imgWidth / 2;
      const defaultY = imgHeight / 2;

      const fabricJointImg = new fabric.Image(jointImg, {
        scaleX,
        scaleY,
        top: defaultY,
        left: defaultX,
        borderColor: 'red',
        cornerColor: 'red',
        originX: 'center',
        originY: 'center'
      });
      fabricCanvas.add(fabricJointImg);
    });

    var text = new fabric.Text('Thug Life', {
      left: imgWidth / 2,
      top: (imgHeight / 6) * 5,
      fontFamily: 'Germanica',
      fill: 'white',
      originX: 'center',
      originY: 'center'
    });
    fabricCanvas.add(text);
  }

  onReadyClicked = () => {
    this.props.onReadyClicked(this.fabricCanvas.toJSON());
  };

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
