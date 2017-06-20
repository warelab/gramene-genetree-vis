"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function remap(seqPos, blocks) {
  var posInSeq = 0;
  for (var b = 0; b < blocks.length; b++) {
    var block = blocks[b];
    var blockLength = block.end - block.start + 1;
    if (seqPos <= posInSeq + blockLength) {
      return block.start + (seqPos - posInSeq);
    }
    posInSeq += blockLength;
  }
  return 0;
}

var ExonJunctions = function (_Component) {
  _inherits(ExonJunctions, _Component);

  function ExonJunctions() {
    _classCallCheck(this, ExonJunctions);

    return _possibleConstructorReturn(this, (ExonJunctions.__proto__ || Object.getPrototypeOf(ExonJunctions)).apply(this, arguments));
  }

  _createClass(ExonJunctions, [{
    key: "render",
    value: function render() {
      var node = this.props.node;
      var alignment = this.props.alignment;

      var k = 0;
      var bins = node.model.exon_junctions.map(function (ej) {
        var ejPos = remap(ej, alignment.blocks);
        var top = ejPos - 1;
        var style = { fill: "red", stroke: false };
        k++;
        return _react2.default.createElement("rect", { key: k, width: "1", height: "18", x: top, style: style });
      });

      return _react2.default.createElement(
        "g",
        { className: "exonJunctions" },
        bins
      );
    }
  }]);

  return ExonJunctions;
}(_react.Component);

exports.default = ExonJunctions;
;