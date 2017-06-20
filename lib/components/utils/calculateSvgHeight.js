'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PIXELS_PER_X_INDEX = 18;
var DEFAULT_SVG_HEIGHT = 250;

function calculateSvgHeight(genetree) {
  if (genetree && _lodash2.default.isNumber(genetree.minXindex) && _lodash2.default.isNumber(genetree.maxXindex)) {
    return (genetree.maxXindex - genetree.minXindex) * PIXELS_PER_X_INDEX;
  } else {
    return DEFAULT_SVG_HEIGHT;
  }
}

exports.default = calculateSvgHeight;