'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Alignment = require('./Alignment.jsx');

var _Alignment2 = _interopRequireDefault(_Alignment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var microsoftBrowser = require('../utils/microsoftBrowser');

var PositionedAlignment = function (_Component) {
  _inherits(PositionedAlignment, _Component);

  function PositionedAlignment(props) {
    _classCallCheck(this, PositionedAlignment);

    var _this = _possibleConstructorReturn(this, (PositionedAlignment.__proto__ || Object.getPrototypeOf(PositionedAlignment)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(PositionedAlignment, [{
    key: 'transform',
    value: function transform(isStyle) {
      var x, y, px;

      px = isStyle ? 'px' : '';

      x = 0;
      y = this.props.node.x; // - 7;

      return 'translate(' + x + px + ', ' + y + px + ')';
    }
  }, {
    key: 'render',
    value: function render() {
      var props = {};
      if (microsoftBrowser) {
        props.transform = this.transform(false);
      } else {
        props.style = { transform: this.transform(true) };
      }

      return _react2.default.createElement(
        'g',
        props,
        _react2.default.createElement(_Alignment2.default, { width: this.props.width, node: this.props.node, highlight: this.props.highlight, stats: this.props.stats, domains: this.props.domains, alignment: this.props.alignment })
      );
    }
  }]);

  return PositionedAlignment;
}(_react.Component);

exports.default = PositionedAlignment;
;