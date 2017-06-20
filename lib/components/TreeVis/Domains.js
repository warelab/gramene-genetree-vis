'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

var _reactBootstrap = require('react-bootstrap');

var _calculateAlignment = require('../utils/calculateAlignment');

var _domainsStats = require('../utils/domainsStats');

var _domainsStats2 = _interopRequireDefault(_domainsStats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Domains = function (_Component) {
  _inherits(Domains, _Component);

  function Domains() {
    _classCallCheck(this, Domains);

    return _possibleConstructorReturn(this, (Domains.__proto__ || Object.getPrototypeOf(Domains)).apply(this, arguments));
  }

  _createClass(Domains, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      if (this.props.node.hasChildren()) {
        this.cladeStats = (0, _domainsStats2.default)(this.props.node);
      }
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate() {
      if (this.props.node.hasChildren()) {
        this.cladeStats = (0, _domainsStats2.default)(this.props.node);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'g',
        { className: 'domains' },
        this.renderDomains()
      );
    }
  }, {
    key: 'renderDomains',
    value: function renderDomains() {
      var nonOverlappingDomains = (0, _calculateAlignment.resolveOverlaps)(this.props.domains);
      return nonOverlappingDomains.map(function (domain, idx) {
        var w = domain.end - domain.start + 1;
        var stats = this.props.stats[domain.id];

        var color = stats.color;
        var opacity = 0.1;
        var style = { fill: color, stroke: color, fillOpacity: opacity };

        return _react2.default.createElement(
          _reactBootstrap.OverlayTrigger,
          { key: idx,
            trigger: ['click', 'focus'], rootClose: true,
            placement: 'bottom',
            overlay: this.renderPopover(domain) },
          _react2.default.createElement('rect', {
            width: w,
            height: '18',
            x: domain.start,
            style: style })
        );
      }.bind(this));
    }
  }, {
    key: 'renderPopover',
    value: function renderPopover(domain) {
      var title = domain.id + ' - ' + domain.name;
      return _react2.default.createElement(
        _reactBootstrap.Popover,
        { id: domain.name, title: title },
        this.renderPopoverContent(domain)
      );
    }
  }, {
    key: 'renderPopoverContent',
    value: function renderPopoverContent(domain) {
      if (this.props.node.isRoot()) {
        return this.renderRootNodePopoverContent(domain);
      }
      if (this.props.node.hasChildren()) {
        return this.renderInternalNodePopoverContent(domain);
      } else {
        return this.renderGeneNodePopoverContent(domain);
      }
    }
  }, {
    key: 'renderRootNodePopoverContent',
    value: function renderRootNodePopoverContent(domain) {
      var stats = this.props.stats[domain.id];

      var treeStatement = createStatement(stats, 'genetree');

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          { className: 'description' },
          domain.description
        ),
        _react2.default.createElement(
          'p',
          { className: 'stats' },
          treeStatement
        )
      );
    }
  }, {
    key: 'renderInternalNodePopoverContent',
    value: function renderInternalNodePopoverContent(domain) {
      var stats = this.props.stats[domain.id];
      var cladeStats = this.cladeStats[domain.id];

      var treeStatement = createStatement(stats, 'genetree');
      var cladeStatement = createStatement(cladeStats, 'clade');

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          { className: 'description' },
          domain.description
        ),
        _react2.default.createElement(
          'p',
          { className: 'stats' },
          treeStatement
        ),
        _react2.default.createElement(
          'p',
          { className: 'stats' },
          cladeStatement
        )
      );
    }
  }, {
    key: 'renderGeneNodePopoverContent',
    value: function renderGeneNodePopoverContent(domain) {
      var stats = this.props.stats[domain.id];
      var statement = createStatement(stats, 'genetree');

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          { className: 'description' },
          domain.description
        ),
        _react2.default.createElement(
          'p',
          { className: 'stats' },
          statement
        )
      );
    }
  }]);

  return Domains;
}(_react.Component);

;

function createStatement(stats, whatIsThis) {
  var geneCount = stats.genesWithDomain;
  var totalGenes = stats.totalGenes;
  var proportion = (0, _numeral2.default)(geneCount / totalGenes).format('0.0%');
  var statement;

  if (geneCount === totalGenes) {
    statement = 'Shared by all ' + totalGenes + ' genes in this ' + whatIsThis + '.';
  } else if (geneCount === 1) {
    statement = 'There is only one gene in the ' + whatIsThis + ' with this domain.';
  } else {
    statement = 'Shared by ' + geneCount + ' of ' + totalGenes + ' (' + proportion + ') genes in this ' + whatIsThis + '.';
  }

  return statement;
}

exports.default = Domains;