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

var Gene = function Gene(props) {
  return _react2.default.createElement(
    'g',
    { className: className(props.node) },
    _react2.default.createElement('circle', { r: '3' }),
    _react2.default.createElement(
      'text',
      { x: '10',
        dy: '.35em' },
      text(props.node)
    )
  );
};

function className(node) {
  var className = void 0,
      homology = void 0,
      repType = void 0;

  className = 'gene';
  homology = _lodash2.default.get(node, 'relationToGeneOfInterest.homology');
  repType = _lodash2.default.get(node, 'relationToGeneOfInterest.repType');
  if (homology) {
    className += ' homolog ' + homology;
  }
  if (repType) {
    className += ' representative';
  }
  return className;
}

function text(node) {
  return _lodash2.default.get(node, 'model.gene_stable_id');
}

Gene.propTypes = {
  node: _propTypes2.default.object.isRequired,
  onHover: _propTypes2.default.func.isRequired,
  taxonomy: _propTypes2.default.object.isRequired
};

exports.default = Gene;