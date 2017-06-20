'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _microsoftBrowser = require('../utils/microsoftBrowser');

var _microsoftBrowser2 = _interopRequireDefault(_microsoftBrowser);

var _reactBootstrap = require('react-bootstrap');

var _NodePopover = require('./NodePopover.jsx');

var _NodePopover2 = _interopRequireDefault(_NodePopover);

var _Edge = require('./Edge.jsx');

var _Edge2 = _interopRequireDefault(_Edge);

var _Node = require('./Node.jsx');

var _Node2 = _interopRequireDefault(_Node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Clade = function (_React$Component) {
  _inherits(Clade, _React$Component);

  function Clade(props) {
    _classCallCheck(this, Clade);

    var _this = _possibleConstructorReturn(this, (Clade.__proto__ || Object.getPrototypeOf(Clade)).call(this, props));

    _this.state = {
      popoverVisible: false
    };
    return _this;
  }

  _createClass(Clade, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setState({ mounted: true });
    }
  }, {
    key: 'hover',
    value: function hover(e) {
      e.stopPropagation();
      this.props.onNodeHover(this.props.node);
      this.setState({ hovered: true });
    }
  }, {
    key: 'unhover',
    value: function unhover(e) {
      e.stopPropagation();
      this.props.onNodeUnhover(this.props.node);
      this.setState({ hovered: false });
    }
  }, {
    key: 'togglePopoverVisibility',
    value: function togglePopoverVisibility() {
      this.setState({
        popoverVisible: !this.state.popoverVisible
      });
    }
  }, {
    key: 'collapseClade',
    value: function collapseClade(node, recurse) {
      this.setState({ popoverVisible: false });
      this.props.collapseClade(node, recurse);
    }
  }, {
    key: 'expandClade',
    value: function expandClade(node, recurse) {
      this.setState({ popoverVisible: false });
      this.props.expandClade(node, recurse);
    }
  }, {
    key: 'changeParalogVisibility',
    value: function changeParalogVisibility(node) {
      this.setState({ popoverVisible: false });
      this.props.changeParalogVisibility(node);
    }
  }, {
    key: 'changeGeneOfInterest',
    value: function changeGeneOfInterest(node) {
      this.setState({ popoverVisible: false });
      this.props.onGeneSelect(node);
    }
  }, {
    key: 'transform',
    value: function transform(isStyle) {
      var px = isStyle ? 'px' : '';
      var x = void 0,
          y = void 0;
      if (this.state.mounted) {
        x = this.props.node.x - this.props.xOffset;
        y = this.props.node.y - this.props.yOffset;
      } else {
        x = this.props.xOffset;
        y = this.props.yOffset;
      }

      return 'translate(' + y + px + ', ' + x + px + ')';
    }
  }, {
    key: 'renderSubClades',
    value: function renderSubClades() {
      var node = this.props.node;
      var treeProps = _lodash2.default.clone(this.props);
      var children = node.children;
      var cladeHovered = !!(this.props.cladeHovered || this.state.hovered);

      if (_lodash2.default.isArray(children) && node.displayInfo.expanded) {
        return children.map(function (childNode, idx) {
          treeProps.node = childNode;
          return _react2.default.createElement(Clade, _extends({}, treeProps, {
            key: idx,
            cladeHovered: cladeHovered,
            xOffset: node.x,
            yOffset: node.y }));
        });
      }
    }
  }, {
    key: 'renderNode',
    value: function renderNode() {
      var _this2 = this;

      var node = this.props.node;

      return _react2.default.createElement(_Node2.default, { node: node,
        onHover: function onHover() {
          return _this2.hover();
        },
        taxonomy: this.props.taxonomy });
    }
  }, {
    key: 'renderEdge',
    value: function renderEdge() {
      var node = this.props.node;
      var parent = node.parent;
      var cladeHovered = !!(this.props.cladeHovered || this.state.hovered);

      if (parent) {
        return _react2.default.createElement(_Edge2.default, { source: node,
          target: parent,
          cladeHovered: cladeHovered,
          thisCladeHovered: !!this.state.hovered });
      }
    }
  }, {
    key: 'overlay',
    value: function overlay(node) {
      var _this3 = this;

      var model = node.model;
      var titleText = model.node_type ? model.taxon_name + ' \u2013 ' + model.node_type : model.gene_display_label ? model.taxon_name + ' \u2013 ' + model.gene_display_label : model.taxon_name + ' - ' + model.gene_stable_id;

      var id = 'nodepopover' + model.node_id;

      var title = _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.Button,
          { className: 'tooltip-title-button',
            bsSize: 'xsmall',
            onClick: this.togglePopoverVisibility.bind(this) },
          '\xD7'
        ),
        _react2.default.createElement(
          'span',
          null,
          titleText
        )
      );

      return _react2.default.createElement(
        _reactBootstrap.Overlay,
        { show: this.state.popoverVisible,
          target: function target(props) {
            return _reactDom2.default.findDOMNode(_this3.refs.clickable);
          } },
        _react2.default.createElement(
          _reactBootstrap.Popover,
          { id: id, title: title },
          _react2.default.createElement(_NodePopover2.default, { node: node,
            collapseClade: this.collapseClade.bind(this),
            expandClade: this.expandClade.bind(this),
            changeParalogVisibility: this.changeParalogVisibility.bind(this),
            changeGeneOfInterest: this.changeGeneOfInterest.bind(this)
          })
        )
      );
    }
  }, {
    key: 'cladeProps',
    value: function cladeProps() {
      var props = {
        className: 'clade'
      };

      if (_microsoftBrowser2.default) {
        props.transform = this.transform(false);
      } else {
        props.style = { transform: this.transform(true) };
      }

      return props;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'g',
        this.cladeProps(),
        _react2.default.createElement(
          'g',
          { ref: 'clickable', onClick: this.togglePopoverVisibility.bind(this) },
          this.renderEdge(),
          this.renderNode()
        ),
        this.overlay(this.props.node),
        this.renderSubClades()
      );
    }
  }]);

  return Clade;
}(_react2.default.Component);

exports.default = Clade;


Clade.propTypes = {
  node: _propTypes2.default.object.isRequired,
  cladeHovered: _propTypes2.default.bool,
  xOffset: _propTypes2.default.number.isRequired,
  yOffset: _propTypes2.default.number.isRequired
};