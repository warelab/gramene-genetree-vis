'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var neighborhoodHeight = 24;

var NeighborhoodArrow = function NeighborhoodArrow(props) {
  var arrowLength = 10 * props.totalLength / props.width;
  var arrowHeight = 4;
  var lineLength = props.totalLength;
  var lineStart = 0;
  var lineEnd = lineLength;
  var arrowHead = void 0;
  if (props.strand) {
    var flipped = props.strand === 'reverse';
    lineStart = flipped ? arrowLength : 0;
    lineEnd = flipped ? lineLength : lineLength - arrowLength;
    var tipX = flipped ? 0 : lineLength;
    var tailX = flipped ? arrowLength : tipX - arrowLength;
    var tipY = neighborhoodHeight / 2;
    var points = tipX + ',' + tipY + ' ' + tailX + ',' + (tipY + arrowHeight) + ' ' + tailX + ',' + (tipY - arrowHeight);
    arrowHead = _react2.default.createElement('polygon', { points: points });
  }
  var tickMarks = [];
  for (var i = 1; i < lineLength; i++) {
    var tick = _react2.default.createElement('line', {
      x1: i, y1: 4,
      x2: i, y2: 20,
      stroke: 'black',
      strokeWidth: '0.01',
      key: i
    });
    tickMarks.push(tick);
  }
  return _react2.default.createElement(
    'g',
    null,
    _react2.default.createElement('line', {
      x1: lineStart, y1: neighborhoodHeight / 2,
      x2: lineEnd, y2: neighborhoodHeight / 2,
      stroke: 'black',
      strokeWidth: '2'
    }),
    tickMarks,
    arrowHead
  );
};

var ComparaGene = function ComparaGene(props) {
  var gene = props.gene;
  return _react2.default.createElement('line', {
    x1: gene.x - 0.3, y1: 4,
    x2: gene.x + 0.3, y2: 20,
    stroke: 'green',
    strokeWidth: '0.1'
  });
};

var NonCodingGroup = function NonCodingGroup(props) {
  var x = +props.x;
  var n = props.genes.length;
  return _react2.default.createElement('line', {
    x1: x - 0.3, y1: 20,
    x2: x + 0.3, y2: 4,
    stroke: 'red',
    strokeWidth: '0.1'
  });
};

var Neighborhood = function (_React$Component) {
  _inherits(Neighborhood, _React$Component);

  function Neighborhood(props) {
    _classCallCheck(this, Neighborhood);

    var _this = _possibleConstructorReturn(this, (Neighborhood.__proto__ || Object.getPrototypeOf(Neighborhood)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(Neighborhood, [{
    key: 'render',
    value: function render() {
      var neighborhood = this.props.neighborhood;
      var comparaGenes = [];
      var nonCodingGeneGroup = {};
      var center_x = this.props.totalLength / 2;
      var centralGene = neighborhood.genes[neighborhood.center_idx];

      if (neighborhood.strand === 'reverse') {
        neighborhood.genes.forEach(function (gene) {
          gene.x = center_x - (centralGene.compara_idx - gene.compara_idx);
          if (gene.gene_tree) {
            comparaGenes.push(_react2.default.createElement(ComparaGene, { gene: gene, key: gene.x }));
          } else {
            // non coding
            gene.x = center_x - (centralGene.compara_idx - gene.compara_idx + 0.5);
            if (!nonCodingGeneGroup.hasOwnProperty(gene.x)) {
              nonCodingGeneGroup[gene.x] = [];
            }
            nonCodingGeneGroup[gene.x].push(gene);
          }
        });
      } else {
        // forward
        neighborhood.genes.forEach(function (gene) {
          gene.x = center_x + (centralGene.compara_idx - gene.compara_idx);
          if (gene.gene_tree) {
            comparaGenes.push(_react2.default.createElement(ComparaGene, { gene: gene, key: gene.x }));
          } else {
            // non coding
            gene.x = center_x + (centralGene.compara_idx - gene.compara_idx + 0.5);
            if (!nonCodingGeneGroup.hasOwnProperty(gene.x)) {
              nonCodingGeneGroup[gene.x] = [];
            }
            nonCodingGeneGroup[gene.x].push(gene);
          }
        });
      }
      var nonCodingGenes = [];
      for (var x in nonCodingGeneGroup) {
        console.log(x, nonCodingGeneGroup[x]);
        nonCodingGenes.push(_react2.default.createElement(NonCodingGroup, { x: x, key: x, genes: nonCodingGeneGroup[x] }));
      }
      return _react2.default.createElement(
        'g',
        { className: 'Neighborhood' },
        _react2.default.createElement(NeighborhoodArrow, { strand: neighborhood.strand, width: this.props.width, totalLength: this.props.totalLength }),
        comparaGenes,
        nonCodingGenes
      );
    }
  }]);

  return Neighborhood;
}(_react2.default.Component);

exports.default = Neighborhood;