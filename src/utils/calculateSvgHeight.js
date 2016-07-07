var _ = require('lodash');

const PIXELS_PER_X_INDEX = 18;
const DEFAULT_SVG_HEIGHT = 250;

function calculateSvgHeight(genetree) {
  if(genetree && _.isNumber(genetree.minXindex) && _.isNumber(genetree.maxXindex)) {
    return (genetree.maxXindex - genetree.minXindex) * PIXELS_PER_X_INDEX;
  }
  else {
    return DEFAULT_SVG_HEIGHT;
  }
}

module.exports = calculateSvgHeight;