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

var _PositionedExonJunctions = require('../PositionedExonJunctions.jsx');

var _PositionedExonJunctions2 = _interopRequireDefault(_PositionedExonJunctions);

var _calculateAlignment = require('../../utils/calculateAlignment');

var _calculateAlignment2 = _interopRequireDefault(_calculateAlignment);

var _positionDomains = require('../../utils/positionDomains');

var _positionDomains2 = _interopRequireDefault(_positionDomains);

var _interact = require('interact.js');

var _interact2 = _interopRequireDefault(_interact);

var _reactBootstrap = require('react-bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MSAOverview = function (_React$Component) {
  _inherits(MSAOverview, _React$Component);

  function MSAOverview(props) {
    _classCallCheck(this, MSAOverview);

    var _this = _possibleConstructorReturn(this, (MSAOverview.__proto__ || Object.getPrototypeOf(MSAOverview)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(MSAOverview, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.consensusLength = this.props.rootNode.model.consensus.sequence.length;
      this.charWidth = 7.2065;
      this.minWidth = this.props.width * this.props.width / (this.charWidth * this.consensusLength);
      this.MSARange = this.props.MSARange;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.zoomer) {
        var x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
        var y = parseFloat(this.zoomer.getAttribute('data-y')) || 0;
        this.zoomer.style.webkitTransform = this.zoomer.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        this.zoomer.style.width = this.props.width * (this.MSARange.MSAStop - this.MSARange.MSAStart) / this.consensusLength + 'px';
        (0, _interact2.default)(this.zoomer).draggable({
          onmove: this.dragMoveListener.bind(this)
        }).resizable({
          preserveAspectRatio: false,
          edges: { left: true, right: true, bottom: false, top: false }
        }).on('resizemove', function (event) {
          if (event.rect.width > this.minWidth) {
            var target = event.target;
            var _x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
            var _y = parseFloat(target.getAttribute('data-y')) || 0;
            if (event.deltaRect.left !== 0) {
              // move left edge
              _x += event.deltaRect.left;
              if (_x < 0) _x = 0;
              this.MSARange.MSAStart = _x * this.consensusLength / this.props.width;
            }
            if (event.deltaRect.right !== 0) {
              // move right edge
              var right = _x + event.rect.width;
              if (right > this.props.width) right = this.props.width;
              this.MSARange.MSAStop = right * this.consensusLength / this.props.width;
            }
            var viewWidth = this.MSARange.MSAStop - this.MSARange.MSAStart;
            target.style.width = this.props.width * viewWidth / this.consensusLength + 'px';
            target.style.webkitTransform = target.style.transform = 'translate(' + _x + 'px,' + _y + 'px)';
            target.setAttribute('data-x', _x);
            // let vb = `${this.MSARange.MSAStart} -3 ${viewWidth} ${this.props.height}`;
            this.alignmentsSVG.setAttribute('viewBox', this.getViewBox(false));
            this.props.handleRangeChange(this.MSARange);
          }
        }.bind(this));
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
      var y = parseFloat(this.zoomer.getAttribute('data-y')) || 0;
      this.zoomer.style.webkitTransform = this.zoomer.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      this.zoomer.style.width = this.props.width * (this.MSARange.MSAStop - this.MSARange.MSAStart) / this.consensusLength + 'px';
    }
  }, {
    key: 'dragMoveListener',
    value: function dragMoveListener(event) {
      if (this.MSARange.MSAStop - this.MSARange.MSAStart < 0.98 * this.consensusLength) {
        var target = event.target,
            x = this.props.width * this.MSARange.MSAStart / this.consensusLength + event.dx,
            y = parseFloat(target.getAttribute('data-y')) || 0;
        // respect boundaries
        if (x < 0) x = 0;
        var zoomerWidth = parseFloat(target.style.width);
        if (x + zoomerWidth > this.props.width) x = this.props.width - zoomerWidth;
        var xPosInSeq = this.consensusLength * x / this.props.width;
        var viewWidth = this.MSARange.MSAStop - this.MSARange.MSAStart;
        // if (xPosInSeq + viewWidth > this.consensusLength) {
        //   viewWidth = this.consensusLength - xPosInSeq;
        // }
        // translate the element
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        // update the position attribute
        target.setAttribute('data-x', x);
        // update the MSA position
        this.MSARange.MSAStart = xPosInSeq;
        this.MSARange.MSAStop = xPosInSeq + viewWidth;
        // let vb = `${xPosInSeq} -3 ${viewWidth} ${this.props.height}`;
        this.alignmentsSVG.setAttribute('viewBox', this.getViewBox(false));
        this.props.handleRangeChange(this.MSARange);
      }
    }
  }, {
    key: 'getViewBox',
    value: function getViewBox(forConsensus) {
      var viewBoxMinX = forConsensus ? 0 : this.MSARange.MSAStart;
      var viewBoxMinY = -3;
      var viewBoxWidth = forConsensus ? this.consensusLength : this.MSARange.MSAStop - this.MSARange.MSAStart;
      var viewBoxHeight = forConsensus ? this.props.controlsHeight : this.props.height + 2 * this.props.margin + 3;
      return viewBoxMinX + ' ' + viewBoxMinY + ' ' + viewBoxWidth + ' ' + viewBoxHeight;
    }
  }, {
    key: 'renderNode',
    value: function renderNode(node) {
      if (node.model.gene_stable_id || !node.displayInfo.expanded) {
        var alignment = _calculateAlignment2.default.calculateAlignment(node);
        var pej = void 0;
        if (node.model.exon_junctions) {
          pej = _react2.default.createElement(_PositionedExonJunctions2.default, { node: node, width: this.props.width, alignment: alignment });
        }
        var domains = (0, _positionDomains2.default)(node);
        return _react2.default.createElement(
          'g',
          { key: node.model.node_id },
          pej,
          _react2.default.createElement(_PositionedAlignment2.default, {
            node: node,
            width: this.props.width,
            stats: this.props.stats,
            domains: domains,
            highlight: false,
            alignment: alignment }),
          _react2.default.createElement(_PositionedDomains2.default, {
            node: node,
            width: this.props.width,
            stats: this.props.stats,
            alignment: alignment,
            domains: domains })
        );
      }
    }
  }, {
    key: 'renderControls',
    value: function renderControls() {
      var _this2 = this;

      var tooltip = _react2.default.createElement(
        _reactBootstrap.Tooltip,
        { id: 'tooltip' },
        'resize and drag'
      );
      return _react2.default.createElement(
        'g',
        null,
        _react2.default.createElement(
          'g',
          { className: 'consensus-wrapper', transform: 'translate(' + this.props.xOffset + ',3)' },
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
            _reactBootstrap.OverlayTrigger,
            { placement: 'left', overlay: tooltip },
            _react2.default.createElement(
              'div',
              { className: 'resize-container' },
              _react2.default.createElement('div', { ref: function ref(e) {
                  return _this2.zoomer = e;
                }, className: 'resize-drag', style: { height: this.props.controlsHeight + 6 } })
            )
          )
        )
      );
    }
  }, {
    key: 'renderOverview',
    value: function renderOverview() {
      var _this3 = this;

      return _react2.default.createElement(
        'g',
        { className: 'alignments-wrapper',
          transform: 'translate(' + this.props.xOffset + ',' + (this.props.yOffset + this.props.controlsHeight + this.props.margin - 10) + ')' },
        _react2.default.createElement(
          'svg',
          { ref: function ref(svg) {
              return _this3.alignmentsSVG = svg;
            },
            width: this.props.width,
            height: this.props.height + 2 * this.props.margin,
            viewBox: this.getViewBox(false),
            preserveAspectRatio: 'none' },
          this.props.nodes.map(this.renderNode.bind(this))
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'g',
        null,
        this.renderOverview(),
        this.renderControls()
      );
    }
  }]);

  return MSAOverview;
}(_react2.default.Component);

exports.default = MSAOverview;