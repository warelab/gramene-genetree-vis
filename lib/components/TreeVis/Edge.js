'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _microsoftBrowser = require('../utils/microsoftBrowser');

var _microsoftBrowser2 = _interopRequireDefault(_microsoftBrowser);

var _taxonomyColor = require('../utils/taxonomyColor');

var _taxonomyColor2 = _interopRequireDefault(_taxonomyColor);

var _Internal = require('./nodeTypes/Internal.jsx');

var _Internal2 = _interopRequireDefault(_Internal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultXAdjust = _Internal2.default.xy;

// see CSS selector ".node:hover .internal"
var HOVER_SCALE_FACTOR = 2;

var Edge = function Edge(props) {
  return _react2.default.createElement(
    'g',
    { className: 'edge' },
    interactionHelper(props),
    edge(props)
  );
};

function pathCoords(props) {
  var adjustedTarget = void 0,
      path = void 0;
  var source = props.source;
  var target = props.target;
  var shouldAdjust = props.cladeHovered && !props.thisCladeHovered;
  var yDoesntChange = _lodash2.default.get(target, 'model.children.length') === 1;

  // stop drawing the edge before it overlaps the parent node
  // (the child edge is always drawn after the parent node)
  var adjust = shouldAdjust ? defaultXAdjust * HOVER_SCALE_FACTOR : defaultXAdjust;

  if (yDoesntChange) {
    adjustedTarget = target.y - adjust;
    path = [[0, 0], [adjustedTarget - source.y, 0]];
  } else {
    adjustedTarget = source.x > target.x ? target.x - adjust : target.x + adjust;
    path = [[0, 0], [target.y - source.y, 0], [target.y - source.y, adjustedTarget - source.x]];
  }

  return path;
};

function transform(c1, c2, size, isStyle) {
  var px = void 0,
      offset = void 0,
      transform = void 0,
      x1 = void 0,
      x2 = void 0,
      y1 = void 0,
      y2 = void 0,
      shouldScaleX = void 0;
  px = isStyle ? 'px' : '';
  size = size || 1;
  offset = size / 2;
  x1 = c1[0];
  y1 = c1[1];
  x2 = c2[0];
  y2 = c2[1];
  shouldScaleX = x1 !== x2;

  // either the x coords (index 0) or y coords (index 1)
  // will differ.

  // if x coords differ, scaleX
  if (shouldScaleX) {
    transform = 'translate(' + (x2 - offset) + px + ', ' + (y2 - offset) + px + ') ' + 'scale(' + (x1 - x2 + offset) + ', ' + size + ') ';
  }
  // otherwise, scaleY
  else {
      transform = 'translate(' + (x2 - offset) + px + ', ' + y2 + px + ') ' + 'scale(' + size + ', ' + (y1 - y2) + ')';
    }

  return transform;
}

function rect(c1, c2, className, size, color) {
  // if either coordinate is missing, don't draw the rectangle.
  if (!c1 || !c2) {
    return;
  }

  var props = {
    className: className,
    style: {
      fill: color
    },
    x: 0,
    y: 0,
    width: 1,
    height: 1
  };

  if (_microsoftBrowser2.default) {
    props.transform = transform(c1, c2, size, false);
  } else {
    props.style.transform = transform(c1, c2, size, true);
  }

  return _react2.default.createElement('rect', props);
}

function edge(props) {
  var coords = pathCoords(props);
  var className = 'edge-rect';
  var size = props.cladeHovered ? Edge.width.hovered : Edge.width.edge;
  var color = (0, _taxonomyColor2.default)(props.source);

  return _react2.default.createElement(
    'g',
    null,
    rect(coords[0], coords[1], className, size, color),
    rect(coords[1], coords[2], className, size, color)
  );
}

function interactionHelper(props) {
  var coords = pathCoords(props);
  var className = 'interaction-rect';
  var size = Edge.width.helper;
  var color = (0, _taxonomyColor2.default)(props.source);
  return _react2.default.createElement(
    'g',
    { className: 'interaction-helper' },
    rect(coords[0], coords[1], className, size, color),
    rect(coords[1], coords[2], className, size, color)
  );
}

Edge.propTypes = {
  source: _propTypes2.default.object.isRequired, // child
  target: _propTypes2.default.object.isRequired, // parent
  cladeHovered: _propTypes2.default.bool.isRequired,
  thisCladeHovered: _propTypes2.default.bool.isRequired
};

Edge.width = {
  edge: 1,
  hovered: 2,
  helper: 4
};

exports.default = Edge;