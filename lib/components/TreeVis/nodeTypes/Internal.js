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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INTERNAL_NODE_SIZE = 4;
var ONE_CHILD_SIZE_RATIO = 0.8;

var Internal = function Internal(props) {
  var hasOneChild = props.node.children.length === 1;
  var xy = hasOneChild ? Internal.xy * ONE_CHILD_SIZE_RATIO : Internal.xy;
  var wh = hasOneChild ? Internal.wh * ONE_CHILD_SIZE_RATIO : Internal.wh;

  return _react2.default.createElement(
    'g',
    { className: className(props.node) },
    _react2.default.createElement('rect', { x: xy, y: xy, width: wh, height: wh }),
    _react2.default.createElement(
      'text',
      { x: '10',
        dy: '.35em',
        textAnchor: 'start' },
      text(props.node)
    )
  );
};

function className(node) {
  var className = 'internal';
  var nodeType = _lodash2.default.get(node, 'model.node_type');
  if (nodeType) {
    className += ' ' + nodeType;
  }
  return className;
}

function text(node) {
  return _lodash2.default.get(node, 'model.gene_display_label') || _lodash2.default.get(node, 'model.gene_stable_id') || '';
}

Internal.propTypes = {
  node: _propTypes2.default.object.isRequired,
  onHover: _propTypes2.default.func.isRequired
};

Internal.xy = INTERNAL_NODE_SIZE / -2;
Internal.wh = INTERNAL_NODE_SIZE;

exports.default = Internal;