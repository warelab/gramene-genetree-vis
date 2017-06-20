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

var _taxonomyColor = require('../../utils/taxonomyColor');

var _taxonomyColor2 = _interopRequireDefault(_taxonomyColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Collapsed = function Collapsed(props) {
  return _react2.default.createElement(
    'g',
    { className: 'collapsed' },
    triangle(props.node),
    text(props.node)
  );
};

function text(node) {
  var texts = void 0,
      homologs = void 0,
      /*orthologs,*/paralogs = void 0;
  homologs = node.leafNodes().length;
  //orthologs = _.get(node, 'displayInfo.orthologs.length') || 0;
  paralogs = _lodash2.default.get(node, 'displayInfo.paralogs.length') || 0;
  texts = [node.model.taxon_name + ': ' + homologs + ' genes'];

  addToTexts(paralogs, 'paralog');
  //addToTexts(orthologs, 'ortholog');

  function addToTexts(count, type) {
    var text = void 0,
        countText = void 0;
    if (count) {
      countText = count === homologs ? 'all' : count;
      text = countText + ' ' + type;
      if (count > 1) text += 's';
      texts.push(text);
    }
  }

  return _react2.default.createElement(
    'text',
    { x: '36',
      dy: '.35em' },
    texts.join(', ')
  );
}

function style(node) {
  var color = (0, _taxonomyColor2.default)(node);
  return { fill: color, stroke: color };
}

function triangle(node) {
  var d = 'M0,0 30,8 30,-8 0,0';

  return _react2.default.createElement('path', { d: d, style: style(node) });
}

Collapsed.propTypes = {
  node: _propTypes2.default.object.isRequired,
  onHover: _propTypes2.default.func.isRequired
};

exports.default = Collapsed;