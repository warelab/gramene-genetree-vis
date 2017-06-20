'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Collapsed = require('./nodeTypes/Collapsed.jsx');

var _Collapsed2 = _interopRequireDefault(_Collapsed);

var _Internal = require('./nodeTypes/Internal.jsx');

var _Internal2 = _interopRequireDefault(_Internal);

var _Gene = require('./nodeTypes/Gene.jsx');

var _Gene2 = _interopRequireDefault(_Gene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Node = function Node(props) {
  return _react2.default.createElement(
    'g',
    { className: 'node' },
    _react2.default.createElement('rect', { className: 'interaction-helper', x: '-5', y: '-5', width: '10', height: '10' }),
    _react2.default.createElement(getNodeComponent(props.node), props)
  );
};

function getNodeType(node) {
  if (node.model.gene_stable_id) {
    return 'Gene';
  } else if (!node.displayInfo.expanded) {
    return 'Collapsed';
  } else {
    return 'Internal';
  }
}

function getNodeComponent(node) {
  switch (getNodeType(node)) {
    case 'Gene':
      return _Gene2.default;
    case 'Collapsed':
      return _Collapsed2.default;
    case 'Internal':
      return _Internal2.default;
  }
}

Node.propTypes = {
  node: _propTypes2.default.object.isRequired,
  taxonomy: _propTypes2.default.object.isRequired
};

exports.default = Node;