'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PositionedAlignment = require('../PositionedAlignment.jsx');

var _PositionedAlignment2 = _interopRequireDefault(_PositionedAlignment);

var _PositionedDomains = require('../PositionedDomains.jsx');

var _PositionedDomains2 = _interopRequireDefault(_PositionedDomains);

var _calculateAlignment = require('../../utils/calculateAlignment');

var _calculateAlignment2 = _interopRequireDefault(_calculateAlignment);

var _positionDomains = require('../../utils/positionDomains');

var _positionDomains2 = _interopRequireDefault(_positionDomains);

var _interact = require('interact.js');

var _interact2 = _interopRequireDefault(_interact);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MSASequence = function (_React$Component) {
  _inherits(MSASequence, _React$Component);

  function MSASequence(props) {
    _classCallCheck(this, MSASequence);

    var _this = _possibleConstructorReturn(this, (MSASequence.__proto__ || Object.getPrototypeOf(MSASequence)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(MSASequence, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.consensusLength = this.props.rootNode.model.consensus.sequence.length;
      this.charWidth = 7.2065;
      this.charsAtOnce = this.props.width / this.charWidth;
      this.windowWidth = this.props.width * this.props.width / (this.charWidth * this.consensusLength);
      this.MSARange = this.props.MSARange;
    }
  }, {
    key: 'dragMoveListener',
    value: function dragMoveListener(event) {
      var target = event.target,
          x = this.props.width * this.MSARange.MSAStart / this.consensusLength + event.dx,
          y = parseFloat(target.getAttribute('data-y')) || 0;
      // respect boundaries
      if (x < 0) x = 0;
      if (x > this.props.width - this.windowWidth) x = this.props.width - this.windowWidth;
      // translate the element
      target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      // update the position attribute
      target.setAttribute('data-x', x);
      // update the MSA position
      var Xmin = x * this.consensusLength / this.props.width;
      var rows = document.getElementsByClassName('MSAlignments-wrapper');
      rows[0].scrollLeft = Xmin * this.charWidth;
      this.MSARange.MSAStart = Xmin;
      this.MSARange.MSAStop = Xmin + this.charsAtOnce;
      this.props.handleRangeChange(this.MSARange);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.zoomer) {
        var x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
        var y = parseFloat(this.zoomer.getAttribute('data-y')) || 0;
        this.zoomer.style.webkitTransform = this.zoomer.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        this.zoomer.style.width = this.windowWidth + 'px';
        var rows = document.getElementsByClassName('MSAlignments-wrapper');
        rows[0].scrollLeft = this.MSARange.MSAStart * this.charWidth;

        (0, _interact2.default)(this.zoomer).draggable({
          onmove: this.dragMoveListener.bind(this)
        });
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.windowWidth = this.props.width * this.props.width / (this.charWidth * this.consensusLength);
      this.charsAtOnce = this.props.width / this.charWidth;
      var x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
      var y = parseFloat(this.zoomer.getAttribute('data-y')) || 0;
      this.zoomer.style.webkitTransform = this.zoomer.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      var rows = document.getElementsByClassName('MSAlignments-wrapper');
      rows[0].scrollLeft = this.MSARange.MSAStart * this.charWidth;
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (nextProps.colorScheme !== this.props.colorScheme) {
        // change the className - don't render again CSS will do the work
        var rows = document.getElementsByClassName(this.props.colorScheme);
        while (rows.length > 0) {
          rows[0].className = nextProps.colorScheme;
          // N.B. rows is a live set of DOM elements
          // which shrinks as you change className
        }
        return false;
      }
      return true;
    }
  }, {
    key: 'getViewBox',
    value: function getViewBox() {
      var viewBoxMinX = 0;
      var viewBoxMinY = -3;
      var viewBoxWidth = this.consensusLength;
      var viewBoxHeight = this.props.controlsHeight;
      return viewBoxMinX + ' ' + viewBoxMinY + ' ' + viewBoxWidth + ' ' + viewBoxHeight;
    }
  }, {
    key: 'renderNode',
    value: function renderNode(node) {
      var alignment = _calculateAlignment2.default.calculateAlignment(node);
      var domains = (0, _positionDomains2.default)(node);
      return _react2.default.createElement(
        'g',
        { key: node.model.node_id },
        _react2.default.createElement(_PositionedAlignment2.default, { node: node, width: this.props.width, stats: this.props.stats, domains: domains,
          highlight: false, alignment: alignment }),
        _react2.default.createElement(_PositionedDomains2.default, { node: node, width: this.props.width, stats: this.props.stats, domains: domains,
          alignment: alignment })
      );
    }
  }, {
    key: 'renderSequence',
    value: function renderSequence(node) {
      if (node.model.gene_stable_id || !node.displayInfo.expanded) {
        var MSAProps = {
          key: node.model.node_id,
          className: this.props.colorScheme
        };
        var seq = node.model.consensus.sequence;
        var spans = []; // hold the lengths of each run
        var spanStart = 0;
        for (var i = 1; i < seq.length; i++) {
          if (seq[i] !== seq[spanStart]) {
            spans.push(i - spanStart);
            spanStart = i;
          }
        }
        spans.push(seq.length - spanStart);

        var offset = 0;
        var gapCode = '-'.charCodeAt(0);
        var msaRow = [];
        for (var _i = 0; _i < spans.length; _i++) {
          var bases = String.fromCharCode.apply(this, seq.slice(offset, offset + spans[_i]));
          var className = seq[offset] === gapCode ? 'gap' : bases.charAt(0);
          msaRow.push(_react2.default.createElement(
            'span',
            { key: _i, className: className },
            bases
          ));
          offset += spans[_i];
        }
        return _react2.default.createElement(
          'div',
          MSAProps,
          msaRow
        );
      }
    }
  }, {
    key: 'renderControls',
    value: function renderControls() {
      var _this2 = this;

      return _react2.default.createElement(
        'g',
        null,
        _react2.default.createElement(
          'g',
          { className: 'viz-wrapper', transform: 'translate(' + this.props.xOffset + ',3)' },
          _react2.default.createElement(
            'svg',
            { width: this.props.width,
              height: this.props.controlsHeight,
              viewBox: this.getViewBox(true),
              preserveAspectRatio: 'none' },
            this.renderNode(this.props.rootNode)
          )
        ),
        _react2.default.createElement(
          'foreignObject',
          { x: this.props.xOffset,
            y: this.props.yOffset,
            width: this.props.width,
            height: this.props.controlsHeight + 6 },
          _react2.default.createElement(
            'div',
            { className: 'resize-container' },
            _react2.default.createElement('div', { ref: function ref(e) {
                return _this2.zoomer = e;
              }, className: 'resize-drag', style: { height: this.props.controlsHeight + 6 } })
          )
        )
      );
    }
  }, {
    key: 'renderMSA',
    value: function renderMSA() {
      return _react2.default.createElement(
        'foreignObject',
        { x: this.props.xOffset,
          y: this.props.yOffset + this.props.controlsHeight + this.props.margin - 10,
          width: this.props.width,
          height: this.props.height + 2 * this.props.margin + 3 },
        _react2.default.createElement(
          'div',
          { className: 'MSAlignments-wrapper' },
          this.props.nodes.map(this.renderSequence.bind(this))
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'g',
        null,
        this.renderMSA(),
        this.renderControls()
      );
    }
  }]);

  return MSASequence;
}(_react2.default.Component);

exports.default = MSASequence;