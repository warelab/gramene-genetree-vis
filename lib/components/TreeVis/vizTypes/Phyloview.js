'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PositionedNeighborhood = require('../PositionedNeighborhood.jsx');

var _PositionedNeighborhood2 = _interopRequireDefault(_PositionedNeighborhood);

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
      this.totalLength = 2 + 2 * this.props.numberOfNeighbors;
      this.viewRange = {
        min: this.props.numberOfNeighbors / 2,
        max: .75 * this.totalLength
      };
      this.minWidth = this.props.width * 4 / this.totalLength;
      if (this.viewRange.max - this.viewRange.min <= this.minWidth) {
        this.viewRange.min = 0;
        this.viewRange.max = this.totalLength;
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.zoomer) {
        var x = this.props.width * this.viewRange.min / this.totalLength;
        var y = parseFloat(this.zoomer.getAttribute('data-y')) || 0;
        this.zoomer.style.webkitTransform = this.zoomer.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        this.zoomer.style.width = this.props.width * (this.viewRange.max - this.viewRange.min) / this.totalLength + 'px';
        (0, _interact2.default)(this.zoomer).draggable({
          onmove: this.dragMoveListener.bind(this)
        }).resizable({
          preserveAspectRatio: false,
          edges: { left: true, right: true, bottom: false, top: false }
        }).on('resizemove', function (event) {
          if (event.rect.width > this.minWidth) {
            var target = event.target;
            var _x = this.props.width * this.viewRange.min / this.totalLength;
            var _y = parseFloat(target.getAttribute('data-y')) || 0;
            if (event.deltaRect.left !== 0) {
              // move left edge
              _x += event.deltaRect.left;
              if (_x < 0) _x = 0;
              this.viewRange.min = _x * this.totalLength / this.props.width;
            }
            if (event.deltaRect.right !== 0) {
              // move right edge
              var right = _x + event.rect.width;
              if (right > this.props.width) right = this.props.width;
              this.viewRange.max = right * this.totalLength / this.props.width;
            }
            var viewWidth = this.viewRange.max - this.viewRange.min;
            target.style.width = this.props.width * viewWidth / this.totalLength + 'px';
            target.style.webkitTransform = target.style.transform = 'translate(' + _x + 'px,' + _y + 'px)';
            target.setAttribute('data-x', _x);
            this.neighborhoodsSVG.setAttribute('viewBox', this.getViewBox(false));
          }
        }.bind(this));
      }
    }
  }, {
    key: 'dragMoveListener',
    value: function dragMoveListener(event) {
      if (this.viewRange.max - this.viewRange.min + 1 < 0.98 * this.totalLength) {
        var target = event.target,
            x = this.props.width * this.viewRange.min / this.totalLength + event.dx,
            y = parseFloat(target.getAttribute('data-y')) || 0;
        // respect boundaries
        if (x < 0) x = 0;
        var zoomerWidth = parseFloat(target.style.width);
        if (x + zoomerWidth > this.props.width) x = this.props.width - zoomerWidth;
        var xPosInSeq = this.totalLength * x / this.props.width;
        var viewWidth = this.viewRange.max - this.viewRange.min;
        // translate the element
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        // update the position attribute
        target.setAttribute('data-x', x);
        // update the view position
        this.viewRange.min = xPosInSeq;
        this.viewRange.max = xPosInSeq + viewWidth;
        this.neighborhoodsSVG.setAttribute('viewBox', this.getViewBox(false));
      }
    }
  }, {
    key: 'getViewBox',
    value: function getViewBox(forConsensus) {
      var viewBoxMinX = forConsensus ? 0 : this.viewRange.min;
      var viewBoxMinY = 0;
      var viewBoxWidth = forConsensus ? this.totalLength : this.viewRange.max - this.viewRange.min;
      var viewBoxHeight = forConsensus ? this.props.controlsHeight : this.props.height + 2 * this.props.margin;
      return viewBoxMinX + ' ' + viewBoxMinY + ' ' + viewBoxWidth + ' ' + viewBoxHeight;
    }
  }, {
    key: 'renderNode',
    value: function renderNode(node) {
      if (node.model.gene_stable_id || !node.displayInfo.expanded) {
        var neighborhood = node.model.gene_stable_id ? this.props.neighborhoods[node.model.gene_stable_id] : { genes: [] };
        return _react2.default.createElement(
          'g',
          { key: node.model.node_id },
          _react2.default.createElement(_PositionedNeighborhood2.default, { node: node, width: this.props.width, totalLength: this.totalLength, neighborhood: neighborhood })
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
            this.renderNode(this.props.queryNode)
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
    key: 'renderPhyloview',
    value: function renderPhyloview() {
      var _this3 = this;

      return _react2.default.createElement(
        'g',
        { className: 'phyloview-wrapper',
          transform: 'translate(' + this.props.xOffset + ',' + (this.props.yOffset + this.props.controlsHeight + this.props.margin - 10) + ')' },
        _react2.default.createElement(
          'svg',
          { ref: function ref(svg) {
              return _this3.neighborhoodsSVG = svg;
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
        this.renderPhyloview(),
        this.renderControls()
      );
    }
  }]);

  return MSAOverview;
}(_react2.default.Component);

exports.default = MSAOverview;