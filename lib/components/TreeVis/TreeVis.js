'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _GeneTree = require('./GeneTree.jsx');

var _GeneTree2 = _interopRequireDefault(_GeneTree);

var _MSAOverview = require('./vizTypes/MSAOverview.jsx');

var _MSAOverview2 = _interopRequireDefault(_MSAOverview);

var _MSASequence = require('./vizTypes/MSASequence.jsx');

var _MSASequence2 = _interopRequireDefault(_MSASequence);

var _Phyloview = require('./vizTypes/Phyloview.jsx');

var _Phyloview2 = _interopRequireDefault(_Phyloview);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _grameneSearchClient = require('gramene-search-client');

var _grameneTreesClient = require('gramene-trees-client');

var _grameneTreesClient2 = _interopRequireDefault(_grameneTreesClient);

var _relateGeneToTree = require('../utils/relateGeneToTree');

var _relateGeneToTree2 = _interopRequireDefault(_relateGeneToTree);

var _calculateSvgHeight = require('../utils/calculateSvgHeight');

var _calculateSvgHeight2 = _interopRequireDefault(_calculateSvgHeight);

var _layoutNodes = require('../utils/layoutNodes');

var _layoutNodes2 = _interopRequireDefault(_layoutNodes);

var _visibleNodes = require('../utils/visibleNodes');

var _reactBootstrap = require('react-bootstrap');

var _domainsStats = require('../utils/domainsStats');

var _domainsStats2 = _interopRequireDefault(_domainsStats);

var _getNeighbors = require('../utils/getNeighbors');

var _getNeighbors2 = _interopRequireDefault(_getNeighbors);

var _calculateAlignment = require('../utils/calculateAlignment');

var _calculateAlignment2 = _interopRequireDefault(_calculateAlignment);

var _positionDomains = require('../utils/positionDomains');

var _positionDomains2 = _interopRequireDefault(_positionDomains);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pruneTree = _grameneTreesClient2.default.extensions.pruneTree;
var addConsensus = _grameneTreesClient2.default.extensions.addConsensus;

var DEFAULT_MARGIN = 20;
var DEFAULT_ZOOM_HEIGHT = 20;
var DEFAULT_LABEL_WIDTH = 200;
var MIN_TREE_WIDTH = 50;
var MAX_TREE_WIDTH = 200;
var MIN_VIZ_WIDTH = 150;
var windowResizeDebounceMs = 250;
var rangeChangeDebounceMs = 150;

var TreeVis = function (_React$Component) {
  _inherits(TreeVis, _React$Component);

  function TreeVis(props) {
    _classCallCheck(this, TreeVis);

    var _this = _possibleConstructorReturn(this, (TreeVis.__proto__ || Object.getPrototypeOf(TreeVis)).call(this, props));

    _this.state = {
      geneOfInterest: _this.props.initialGeneOfInterest,
      displayMode: 'phyloview',
      visibleNodes: undefined,
      colorScheme: 'clustal',
      MSARange: {
        MSAStart: 0,
        MSAStop: 0
      }
    };
    _this.displayModes = [{
      id: 'domains',
      label: 'Domains',
      getComponent: function getComponent(app) {
        if (app.geneTreeRoot && app.state.visibleNodes && app.vizWidth && app.domainStats) {
          return _react2.default.createElement(_MSAOverview2.default, {
            nodes: app.state.visibleNodes,
            rootNode: app.geneTreeRoot,
            width: app.vizWidth,
            height: app.treeHeight,
            margin: app.margin,
            xOffset: app.margin + app.treeWidth + app.labelWidth,
            yOffset: 0,
            controlsHeight: DEFAULT_ZOOM_HEIGHT,
            stats: app.domainStats,
            MSARange: app.state.MSARange,
            handleRangeChange: _lodash2.default.debounce(app.updateMSARange.bind(app), rangeChangeDebounceMs),
            transform: app.transformViz
          });
        }
      }
    }, {
      id: 'msa',
      label: 'Multiple Sequence Alignment',
      getComponent: function getComponent(app) {
        if (app.geneTreeRoot && app.state.visibleNodes && app.vizWidth && app.domainStats) {
          return _react2.default.createElement(_MSASequence2.default, {
            nodes: app.state.visibleNodes,
            rootNode: app.geneTreeRoot,
            width: app.vizWidth,
            height: app.treeHeight,
            margin: app.margin,
            xOffset: app.margin + app.treeWidth + app.labelWidth,
            yOffset: 0,
            controlsHeight: DEFAULT_ZOOM_HEIGHT,
            stats: app.domainStats,
            colorScheme: app.state.colorScheme,
            MSARange: app.state.MSARange,
            handleRangeChange: _lodash2.default.debounce(app.updateMSARange.bind(app), rangeChangeDebounceMs),
            transform: app.transformViz
          });
        }
      }
    }, {
      id: 'phyloview',
      label: 'Neighborhood conservation',
      getComponent: function getComponent(app) {
        if (app.state.visibleNodes && app.state.neighborhoods && app.vizWidth) {
          return _react2.default.createElement(_Phyloview2.default, {
            nodes: app.state.visibleNodes,
            queryNode: app.genetree.indices.gene_stable_id[app.state.geneOfInterest._id],
            width: app.vizWidth,
            height: app.treeHeight,
            margin: app.margin,
            xOffset: app.margin + app.treeWidth + app.labelWidth,
            yOffset: 0,
            controlsHeight: DEFAULT_ZOOM_HEIGHT,
            neighborhoods: app.state.neighborhoods,
            numberOfNeighbors: app.props.numberOfNeighbors,
            transform: app.transformViz
          });
        }
      }
    }];
    _this.displayModeIdx = _lodash2.default.keyBy(_this.displayModes, 'id');
    return _this;
  }

  _createClass(TreeVis, [{
    key: 'updateMSARange',
    value: function updateMSARange(MSARange) {
      this.setState(MSARange);
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      // TODO: use web workers to prep data for the tree and viz components
      this.resizeListener = _lodash2.default.debounce(this.updateAvailableWidth.bind(this), windowResizeDebounceMs);
      if (!_lodash2.default.isUndefined(global.addEventListener)) {
        global.addEventListener('resize', this.resizeListener);
      }

      this.domainStats = (0, _domainsStats2.default)(this.props.genetree); // TODO: use a promise and a web worker
      if (!_lodash2.default.isEmpty(this.props.genomesOfInterest)) {
        this.genetree = pruneTree(this.props.genetree, function (node) {
          return this.props.genomesOfInterest.hasOwnProperty(node.model.taxon_id);
        }.bind(this));
        this.genetree.geneCount = this.props.genetree.geneCount;
      } else {
        this.genetree = _lodash2.default.cloneDeep(this.props.genetree);
      }

      addConsensus(this.genetree); // TODO: use a promise
      (0, _relateGeneToTree2.default)(this.genetree, this.props.initialGeneOfInterest, this.props.taxonomy, this.props.pivotTree);
      (0, _visibleNodes.setDefaultNodeDisplayInfo)(this.genetree, this.props.initialGeneOfInterest);
      (0, _visibleNodes.calculateXIndex)(this.genetree);
      this.treeHeight = (0, _calculateSvgHeight2.default)(this.genetree);

      this.geneTreeRoot = _lodash2.default.clone(this.genetree);
      delete this.geneTreeRoot.displayInfo;
      this.geneTreeRoot.displayInfo = {
        expanded: false
      };
      var MSARange = this.state.MSARange;
      MSARange.MSAStop = this.geneTreeRoot.model.consensus.sequence.length;
      this.setState(MSARange);

      (0, _visibleNodes.calculateXIndex)(this.geneTreeRoot);
      (0, _layoutNodes2.default)(this.geneTreeRoot, 0, this.treeHeight);

      //let ma = alignmentTools.calculateAlignment(this.genetree);
      //if (!_.isEmpty(this.props.genomesOfInterest)) {
      //  let gaps = alignmentTools.findGaps(ma);
      //  alignmentTools.removeGaps(gaps, this.genetree);
      //}
      this.domainHist = (0, _positionDomains2.default)(this.genetree, true);
      if (this.props.enablePhyloview) {
        var that = this;
        (0, _getNeighbors2.default)(this.genetree, this.props.numberOfNeighbors, this.props.genomesOfInterest).then(function (neighborhoodsAndFacets) {
          that.setState(neighborhoodsAndFacets);
        });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.resizeListener) {
        global.removeEventListener('resize', this.resizeListener);
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.updateAvailableWidth();
    }
  }, {
    key: 'updateAvailableWidth',
    value: function updateAvailableWidth() {
      var DOMNode = _reactDom2.default.findDOMNode(this);
      var parentWidth = DOMNode.parentNode ? DOMNode.parentNode.clientWidth : DOMNode.clientWidth;
      if (this.width !== parentWidth) {
        this.width = parentWidth;
        this.initHeightAndMargin();
        this.setState({ visibleNodes: (0, _layoutNodes2.default)(this.genetree, this.treeWidth, this.treeHeight) });
      }
    }
  }, {
    key: 'initHeightAndMargin',
    value: function initHeightAndMargin() {
      this.margin = this.props.margin || DEFAULT_MARGIN;
      this.labelWidth = this.props.labelWidth || DEFAULT_LABEL_WIDTH;
      var w = this.width - this.labelWidth - 2 * this.margin;
      this.treeWidth = .25 * w < MIN_TREE_WIDTH ? MIN_TREE_WIDTH : Math.floor(.25 * w);
      if (this.treeWidth > MAX_TREE_WIDTH) this.treeWidth = MAX_TREE_WIDTH;
      this.vizWidth = w - this.treeWidth < MIN_VIZ_WIDTH ? MIN_VIZ_WIDTH : w - this.treeWidth;
      if (this.treeWidth + this.vizWidth + this.labelWidth + 2 * this.margin > this.width) {
        console.log('Is this too small to see everything?');
        this.width = this.treeWidth + this.vizWidth + this.labelWidth + 2 * this.margin;
      }
      this.transformTree = 'translate(' + this.margin + ',' + (this.margin + DEFAULT_ZOOM_HEIGHT) + ')';
      this.transformViz = 'translate(' + (this.margin + this.treeWidth + this.labelWidth) + ',0)';
    }
  }, {
    key: 'handleGeneSelect',
    value: function handleGeneSelect(geneNode) {
      _grameneSearchClient.client.genes(geneNode.model.gene_stable_id).then(function (response) {
        var geneOfInterest = response.docs[0];
        (0, _relateGeneToTree2.default)(this.genetree, geneOfInterest, this.props.taxonomy, this.props.pivotTree);
        (0, _visibleNodes.setDefaultNodeDisplayInfo)(this.genetree, geneOfInterest);
        (0, _visibleNodes.calculateXIndex)(this.genetree);
        this.treeHeight = (0, _calculateSvgHeight2.default)(this.genetree);

        var visibleNodes = (0, _layoutNodes2.default)(this.genetree, this.treeWidth, this.treeHeight);
        this.setState({ geneOfInterest: geneOfInterest, visibleNodes: visibleNodes });
      }.bind(this));
    }
  }, {
    key: 'expandClade',
    value: function expandClade(node, recursive) {
      if (recursive) {
        (0, _visibleNodes.makeCladeVisible)(node);
      } else {
        (0, _visibleNodes.makeNodeVisible)(node);
      }
      this.updateVisibleNodes();
    }
  }, {
    key: 'collapseClade',
    value: function collapseClade(node, recursive) {
      if (recursive) {
        (0, _visibleNodes.makeCladeInvisible)(node);
      } else {
        (0, _visibleNodes.makeNodeInvisible)(node);
      }
      this.updateVisibleNodes();
    }
  }, {
    key: 'updateVisibleNodes',
    value: function updateVisibleNodes() {
      (0, _visibleNodes.calculateXIndex)(this.genetree);
      this.treeHeight = (0, _calculateSvgHeight2.default)(this.genetree);
      var newVisibleNodes = (0, _layoutNodes2.default)(this.genetree, this.treeWidth, this.treeHeight);
      this.setState({
        visibleNodes: newVisibleNodes
      });
    }
  }, {
    key: 'handleNodeUnhover',
    value: function handleNodeUnhover(node) {
      if (this.state.hoveredNode === node) {
        this.setState({ hoveredNode: undefined });
      }
    }
  }, {
    key: 'handleNodeHover',
    value: function handleNodeHover(node) {
      this.setState({ hoveredNode: node });
    }
  }, {
    key: 'changeParalogVisibility',
    value: function changeParalogVisibility(node) {
      if (node.displayInfo.expandedParalogs) {
        // hide these paralogs
        node.displayInfo.paralogs.forEach(function (paralog) {
          var parentNode = paralog.parent;

          var childCallback = function childCallback(child) {
            if (child.displayInfo.expanded) parentNode.displayInfo.expanded = true;
          };

          while (parentNode !== node) {
            parentNode.displayInfo.expandedParalogs = false;
            // check if any child is expanded
            parentNode.displayInfo.expanded = false;
            parentNode.children.forEach(childCallback);
            parentNode = parentNode.parent;
          }
        });
      } else {
        node.displayInfo.paralogs.forEach(function (paralog) {
          var parentNode = paralog.parent;
          while (!parentNode.displayInfo.expanded) {
            parentNode.displayInfo.expanded = true;
            parentNode.displayInfo.expandedParalogs = true;
            parentNode = parentNode.parent;
          }
        });
      }
      this.updateVisibleNodes();
    }
  }, {
    key: 'handleModeSelection',
    value: function handleModeSelection(e) {
      this.setState({ displayMode: e });
    }
  }, {
    key: 'colorSchemeDropdown',
    value: function colorSchemeDropdown() {
      if (this.state.displayMode === 'msa') {
        var toTitleCase = function toTitleCase(str) {
          return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        };

        var colorSchemes = ['clustal', 'zappo', 'taylor', 'hydrophobicity', 'helix_propensity', 'strand_propensity', 'turn_propensity', 'buried_index'];
        var items = colorSchemes.map(function (scheme, i) {
          var _this2 = this;

          return _react2.default.createElement(
            _reactBootstrap.MenuItem,
            { key: i, eventKey: i, active: scheme === this.state.colorScheme,
              onClick: function onClick() {
                return _this2.setState({ colorScheme: scheme });
              }
            },
            toTitleCase(scheme.replace('_', ' '))
          );
        }.bind(this));
        var nofloat = { float: 'none' };
        return _react2.default.createElement(
          _reactBootstrap.DropdownButton,
          { id: 'colorscheme-dropdown',
            title: 'Color Scheme',
            disabled: this.state.displayMode !== 'msa',
            style: nofloat },
          items
        );
      }
    }
  }, {
    key: 'renderToolbar',
    value: function renderToolbar(activeMode) {
      var choices = this.displayModes.map(function (mode, idx) {
        return _react2.default.createElement(
          _reactBootstrap.MenuItem,
          { eventKey: mode.id,
            key: idx,
            active: activeMode === mode.id },
          mode.label
        );
      });
      return _react2.default.createElement(
        _reactBootstrap.ButtonToolbar,
        null,
        _react2.default.createElement(
          _reactBootstrap.Dropdown,
          { id: 'display-mode-dropdown',
            onClick: function onClick(e) {
              return e.stopPropagation();
            } },
          _react2.default.createElement(
            _reactBootstrap.Dropdown.Toggle,
            null,
            'Display mode'
          ),
          _react2.default.createElement(
            _reactBootstrap.Dropdown.Menu,
            { onSelect: this.handleModeSelection.bind(this) },
            choices
          )
        ),
        this.colorSchemeDropdown()
      );
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.state.visibleNodes) {
        return _react2.default.createElement('div', null);
      }
      var genetree = _react2.default.createElement(_GeneTree2.default, { nodes: this.state.visibleNodes,
        onGeneSelect: this.handleGeneSelect.bind(this),
        collapseClade: this.collapseClade.bind(this),
        expandClade: this.expandClade.bind(this),
        changeParalogVisibility: this.changeParalogVisibility.bind(this),
        onNodeHover: this.handleNodeHover,
        onNodeUnhover: this.handleNodeUnhover,
        taxonomy: this.props.taxonomy
      });

      var theViz = this.displayModeIdx[this.state.displayMode].getComponent(this);

      return _react2.default.createElement(
        'div',
        null,
        this.renderToolbar(this.state.displayMode),
        _react2.default.createElement(
          'div',
          { className: 'genetree-vis' },
          _react2.default.createElement(
            'svg',
            { width: this.width, height: this.treeHeight + 2 * this.margin + DEFAULT_ZOOM_HEIGHT },
            _react2.default.createElement(
              'g',
              { className: 'tree-wrapper', transform: this.transformTree },
              genetree
            ),
            theViz
          )
        )
      );
    }
  }]);

  return TreeVis;
}(_react2.default.Component);

exports.default = TreeVis;


TreeVis.propTypes = {
  margin: _propTypes2.default.number,
  genetree: _propTypes2.default.object.isRequired,
  initialGeneOfInterest: _propTypes2.default.object,
  genomesOfInterest: _propTypes2.default.object,
  taxonomy: _propTypes2.default.object,
  pivotTree: _propTypes2.default.bool,
  numberOfNeighbors: _propTypes2.default.number,
  enablePhyloview: _propTypes2.default.bool
};