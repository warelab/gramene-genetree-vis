'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;

var GeneTree = require('./GeneTree.jsx');
var PositionedAlignment = require('./PositionedAlignment.jsx');
var PositionedDomains = require('./PositionedDomains.jsx');
var PositionedExonJunctions = require('./PositionedExonJunctions.jsx');

var relateGeneToTree = require('../utils/relateGeneToTree');
var layoutTree = require('../utils/layoutTree');
var calculateSvgHeight = require('../utils/calculateSvgHeight');
var domainStats = require('../utils/domainsStats').domainStats;
var alignmentTools = require('../utils/calculateAlignment');
var positionDomains = require('../utils/positionDomains');
var pruneTree = require('gramene-trees-client').extensions.pruneTree;

const DEFAULT_MARGIN = 10;
const DEFAULT_LABEL_WIDTH = 200;
const MAX_TREE_WIDTH = 200;
const MIN_ALIGN_WIDTH = 200;
const windowResizeDebounceMs = 250;

var TreeVis = React.createClass({
  propTypes: {
    // width: React.PropTypes.number.isRequired,
    //height: React.PropTypes.number.isRequired,
    margin: React.PropTypes.number,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    genomesOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object,
    allowGeneSelection: React.PropTypes.bool
  },
  
  getInitialState: function () {
    return {
      additionalVisibleNodes: {},
      hoveredNode: undefined
    };
  },
  
  componentWillMount: function() {
    this.genetree = _.cloneDeep(this.props.genetree);

    this.domainStats = domainStats(this.genetree); // do this to all genomes

    this.resizeListener = _.debounce(
      this.updateAvailableWidth,
      windowResizeDebounceMs
    );

    if(!_.isUndefined(global.addEventListener)) {
      global.addEventListener('resize', this.resizeListener);
    }
    
    if (!_.isEmpty(this.props.genomesOfInterest)) {
      this.genetree = pruneTree(this.props.genetree, this.keepNode());
      this.genetree.geneCount = this.props.genetree.geneCount;
    }
    
  },
  
  componentDidMount: function() {
    this.updateAvailableWidth();
  },

  componentWillUnmount: function() {
    if(this.resizeListener) {
      global.removeEventListener('resize', this.resizeListener);
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    function haveSameKeys(a,b) {
      return _.size(a) === _.size(b)
      && _.every(b, (val, key) => !!a[key])
    }
    if (!haveSameKeys(nextProps.genomesOfInterest, this.props.genomesOfInterest)) {
      if (_.isEmpty(nextProps.genomesOfInterest)) {
        this.genetree = _.cloneDeep(nextProps.genetree);
      }
      else {
        this.genetree = pruneTree(nextProps.genetree, this.keepNode(nextProps));
        this.genetree.geneCount = nextProps.genetree.geneCount;
      }
      this.initializedAlignments = false;
      this.initializeAlignments(nextProps)();
      this.initNodes();
      this.reinitHeight();
    }
  },

  updateAvailableWidth: function() {
    const parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;
    if(this.width !== parentWidth) {
      console.log('width is now', parentWidth);
      this.width = parentWidth;
      this.initHeightAndMargin();
      this.initializeAlignments()();
      this.initNodes();
      this.reinitHeight();
    }
  },

  keepNode: function(props = this.props) {
    return function _keepNode(node) {
      if (props.genomesOfInterest.hasOwnProperty(node.model.taxon_id)) return true;
      if (node.model.gene_stable_id &&
        _.has(props, 'initialGeneOfInterest.homology.gene_tree.representative.model.id')) {
        if (node.model.gene_stable_id === props.initialGeneOfInterest.homology.gene_tree.representative.model.id) {
          return true;
        }
      }
      return false;
    }
  },

  initializeAlignments: function(props = this.props) {
    return function _initializeAlignments() {
      if (!this.initializedAlignments) {
        alignmentTools.clean();
        var multipleAlignment = alignmentTools.calculateAlignment(this.genetree); // not necessarily all genomes
        if (!_.isEmpty(props.genomesOfInterest)) {
          // find gaps in multiple alignment
          var gaps = alignmentTools.findGaps(multipleAlignment);
          // remove gaps from alignments
          alignmentTools.removeGaps(gaps, this.genetree);
        }
        this.domainHist = positionDomains(this.genetree,true);
        // this.initializedAlignments = true;
      }
    }.bind(this);
  },
  
  // componentWillMount: function () {
  //   this.initHeightAndMargin();
  //   this.initNodes();
  //   this.reinitHeight();
  // },
  initHeightAndMargin: function () {
    this.margin = this.props.margin || DEFAULT_MARGIN;
    this.labelWidth = this.props.labelWidth || DEFAULT_LABEL_WIDTH;
    this.w = this.width - this.labelWidth - (2 * this.margin);

    this.treeWidth =  this.w / 2 > MAX_TREE_WIDTH ? MAX_TREE_WIDTH : this.w / 2;
    this.alignmentsWidth = this.w - this.treeWidth;
    this.displayAlignments = true;
    if (this.alignmentsWidth < MIN_ALIGN_WIDTH) {
      this.displayAlignments = false;
      this.treeWidth += this.alignmentsWidth;
    }

    this.transformTree = 'translate(' + this.margin + ', ' + this.margin + ')';
    var alignmentOrigin = this.margin + this.treeWidth + this.labelWidth;
    this.transformAlignments = 'translate(' + alignmentOrigin + ', ' + this.margin + ')';
  },
  reinitHeight: function() {
    this.h = calculateSvgHeight(this.genetree); // - (2 * this.margin);
  },
  initNodes: function (geneOfInterest) {
    var visibleNodes;

    geneOfInterest = geneOfInterest || this.props.initialGeneOfInterest;

    relateGeneToTree(this.genetree, geneOfInterest, this.props.taxonomy);
    visibleNodes = layoutTree(this.genetree, geneOfInterest, this.treeWidth, this.state.additionalVisibleNodes);

    this.setState({
      geneOfInterest: geneOfInterest,
      visibleNodes: visibleNodes
    });
  },
  handleGeneSelect: function (geneNode) {
    if(this.props.allowGeneSelection) {
      GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
        var geneOfInterest = response.docs[0];
        this.initNodes(geneOfInterest);
        this.reinitHeight();
      }.bind(this));
    }
  },
  handleInternalNodeSelect: function (node) {
    var additionalVisibleNodes, allVisibleNodes, nodeId;
    additionalVisibleNodes = _.clone(this.state.additionalVisibleNodes);

    nodeId = node.model.node_id;
    if(additionalVisibleNodes[nodeId]) {
      delete additionalVisibleNodes[nodeId];
    } else {
      additionalVisibleNodes[nodeId] = node;
      while (node.children.length === 1) {
        node = node.children[0];
        nodeId = node.model.node_id;
        additionalVisibleNodes[nodeId] = node;
      }
    }

    allVisibleNodes = layoutTree(
      this.genetree,
      this.state.geneOfInterest,
      this.treeWidth,
      additionalVisibleNodes
    );

    this.reinitHeight();

    this.setState({
      additionalVisibleNodes: additionalVisibleNodes,
      visibleNodes: allVisibleNodes
    });
  },
  handleNodeUnhover: function (node) {
    if (this.state.hoveredNode === node) {
      this.setState({hoveredNode: undefined});
    }
  },
  handleNodeHover: function (node) {
    this.setState({hoveredNode: node});
  },
  
  renderBackground: function () {
    if (this.displayAlignments) {
      var bgStyle = {fill: '#f7f7f7', stroke: false};
      var h = this.h + (2 * this.margin);
      var y = -this.margin;
      var x = -this.margin/2;
      var w = this.alignmentsWidth + this.margin;
      return (
        <rect key='bg'
              width={w}
              height={h}
              x={x}
              y={y}
              style={bgStyle}/>
      );
    }
  },
  
  render: function () {
    var genetree, alignments, height;

    if(!this.width) {
      return <div></div>;
    }

    height = this.h + (2 * this.margin);

    if (this.state.visibleNodes) {
      genetree = (
        <GeneTree nodes={this.state.visibleNodes}
                  onGeneSelect={this.handleGeneSelect}
                  onInternalNodeSelect={this.handleInternalNodeSelect}
                  onNodeHover={this.handleNodeHover}
                  onNodeUnhover={this.handleNodeUnhover}
                  taxonomy={this.props.taxonomy} />
      );
      
      if (this.displayAlignments) {
        var hoveredNode = this.state.hoveredNode;
        var width = this.alignmentsWidth;
        var geneOfInterest = this.state.geneOfInterest;
        alignments = this.state.visibleNodes.map(function(node) {
          if (node.model.gene_stable_id || !node.displayInfo.expanded) {
            var hl = (hoveredNode && _.indexOf(node.getPath(),hoveredNode) >= 0) ? '#ffffcc' : '';
            if (geneOfInterest._id === node.model.gene_stable_id) {
              hl = '#ffddaa';
            }
            if (!node.hasChildren() &&
              ( _.get(geneOfInterest, 'homology.gene_tree.representative.model.id') === node.model.gene_stable_id ||
                _.get(geneOfInterest, 'homology.gene_tree.representative.closest.id') === node.model.gene_stable_id) ) {
              hl = '#ccffaa';
            }
            var alignment = alignmentTools.calculateAlignment(node);
            var pej;
            if (node.model.exon_junctions) {
              pej = (
                <PositionedExonJunctions node={node} width={width} alignment={alignment} />
              )
            }
            var domains = positionDomains(node);
            return (
              <g key={node.model.node_id} >
                {pej}
                <PositionedAlignment node={node} width={width} stats={this.domainStats} domains={domains} highlight={false} alignment={alignment} />
                <PositionedDomains node={node} width={width} stats={this.domainStats} domains={domains} alignment={alignment} />
              </g>
            )
          }
        }.bind(this));
      }
    }

    return (
      <div className="genetree-vis">
        <svg width={this.width} height={height}>
          <g className="tree-wrapper" transform={this.transformTree}>
            {genetree}
          </g>
          <g className="alignments-wrapper" transform={this.transformAlignments}>
            {this.renderBackground()}
            {alignments}
          </g>
        </svg>
      </div>
    );
  }
});

module.exports = TreeVis;
