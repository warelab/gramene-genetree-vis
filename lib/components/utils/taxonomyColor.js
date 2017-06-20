'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function taxonomyColor(node) {
  var stats = void 0,
      colorScale = void 0,
      score = void 0;
  stats = _lodash2.default.get(node, 'relationToGeneOfInterest.taxonomy');
  if (stats) {
    score = stats.lcaDistance + stats.pathDistance;
    colorScale = stats.maxima.colorScale;
    return colorScale(score);
  }
}

exports.default = taxonomyColor;