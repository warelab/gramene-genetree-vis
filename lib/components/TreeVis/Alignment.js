'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var scale = require('d3').scale.linear;
var _ = require('lodash');

var alignmentTools = require('../utils/calculateAlignment');

var Alignment = function (_Component) {
  _inherits(Alignment, _Component);

  function Alignment() {
    _classCallCheck(this, Alignment);

    return _possibleConstructorReturn(this, (Alignment.__proto__ || Object.getPrototypeOf(Alignment)).apply(this, arguments));
  }

  _createClass(Alignment, [{
    key: 'getColorMap',
    value: function getColorMap(alignment, stats) {
      var regionColor = [];
      var grayScale = scale().domain([0, alignment.nSeqs]).range(['#DDDDDD', '#444444']);
      var prevEnd = 0;
      if (this.props.domains.length > 0) {
        alignmentTools.resolveOverlaps(this.props.domains).forEach(function (d) {
          if (d.start > prevEnd) {
            regionColor.push({
              start: prevEnd,
              end: d.start,
              color: grayScale
            });
          }
          if (d.start < prevEnd) {
            // TODO: deal with overlapping domains
          }
          if (d.end > prevEnd) {
            prevEnd = d.end;
            var maxColor = stats[d.id].color;
            var colorScale = scale().domain([0, 1]).range(['#FFFFFF', maxColor]);
            regionColor.push({
              start: d.start,
              end: d.end,
              color: scale().domain([0, alignment.nSeqs]).range([colorScale(0.5), maxColor])
            });
          }
        });
      }
      if (prevEnd < alignment.size) {
        regionColor.push({
          start: prevEnd,
          end: alignment.size,
          color: grayScale
        });
      }
      return regionColor;
    }
  }, {
    key: 'renderHighlight',
    value: function renderHighlight() {
      if (this.props.highlight) {
        var hlStyle = { fill: this.props.highlight, stroke: false };
        var u = this.props.alignment.size / this.props.width;
        var w = 4 * u;
        var s = -w - u;
        return _react2.default.createElement('rect', { key: 'highlight',
          x: s,
          width: w,
          height: '18',
          style: hlStyle });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var alignment = _.cloneDeep(this.props.alignment);
      var regionColor = this.getColorMap(alignment, this.props.stats);

      var k = 0;
      var bins = [];
      var offsets = alignmentTools.getOffsets(alignment.hist);
      var depth = 0;
      var regionIdx = 0;

      var renderBlock = function renderBlock(block) {
        var style = { fill: block.color, stroke: false };
        var s = block.start;
        var w = block.end - block.start;
        k++;
        var rect = _react2.default.createElement('rect', { key: k, width: w, height: '14', x: s, style: style });
        return rect;
      };

      for (var i = 0; i < offsets.length - 1; i++) {
        depth += alignment.hist[offsets[i]];
        if (depth > 0) {
          // find the region containing the start of this alignment block
          while (offsets[i] >= regionColor[regionIdx].end) {
            regionIdx++;
          }
          var color = regionColor[regionIdx].color(depth);
          // does the alignment block extend beyond the end of the region?
          if (offsets[i + 1] > regionColor[regionIdx].end) {
            bins.push(renderBlock({
              start: offsets[i],
              end: regionColor[regionIdx].end,
              color: color
            }));
            offsets[i] = regionColor[regionIdx].end;
            if (!alignment.hist.hasOwnProperty(offsets[i])) {
              alignment.hist[offsets[i]] = 0;
            }
            i--;
          } else {
            bins.push(renderBlock({
              start: offsets[i],
              end: offsets[i + 1],
              color: color
            }));
          }
        }
      }
      return _react2.default.createElement(
        'g',
        { className: 'alignment' },
        this.renderHighlight(),
        bins
      );
    }
  }]);

  return Alignment;
}(_react.Component);

;

exports.default = Alignment;