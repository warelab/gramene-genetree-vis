'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Clade = require('./Clade.jsx');

var _Clade2 = _interopRequireDefault(_Clade);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GeneTree = function GeneTree(props) {
  return _react2.default.createElement(
    'g',
    { className: 'genetree' },
    _react2.default.createElement(_Clade2.default, _extends({}, props, { node: props.nodes[0], xOffset: 0, yOffset: 0 }))
  );
};

GeneTree.propTypes = {
  nodes: _propTypes2.default.array.isRequired,
  onGeneSelect: _propTypes2.default.func.isRequired,
  onNodeHover: _propTypes2.default.func.isRequired,
  taxonomy: _propTypes2.default.object
};

exports.default = GeneTree;