'use strict';

var React = require('react');
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;

var GeneTree = require('./GeneTree.jsx');
var PositionedAlignment = require('./PositionedAlignment.jsx');
var PositionedDomains = require('./PositionedDomains.jsx');
var PositionedExonJunctions = require('./PositionedExonJunctions.jsx');

var relateGeneToTree = require('../utils/relateGeneToTree');
var layoutTree = require('../utils/layoutTree');
var calculateSvgHeight = require('../utils/calculateSvgHeight');

const DEFAULT_MARGIN = 10;
const DEFAULT_LABEL_WIDTH = 200;
const MAX_TREE_WIDTH = 300;
const MIN_ALIGN_WIDTH = 200;

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    //height: React.PropTypes.number.isRequired,
    margin: React.PropTypes.number,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object,
    allowGeneSelection: React.PropTypes.bool
  },
  getInitialState: function () {
    return {
      additionalVisibleNodes: {},
      hoveredNode: undefined
    };
  },
  componentWillMount: function () {
    this.initHeightAndMargin();
    this.initNodes();
    this.reinitHeight();
  },
  initHeightAndMargin: function () {
    this.margin = this.props.margin || DEFAULT_MARGIN;
    this.labelWidth = this.props.labelWidth || DEFAULT_LABEL_WIDTH;
    this.w = this.props.width - this.labelWidth - (2 * this.margin);

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
    var genetree, visibleNodes;
    genetree = this.genetree;

    if (!genetree) {
      genetree = this.genetree = _.cloneDeep(this.props.genetree);
    }
    geneOfInterest = geneOfInterest || this.props.initialGeneOfInterest;

    relateGeneToTree(genetree, geneOfInterest, this.props.taxonomy);
    visibleNodes = layoutTree(genetree, geneOfInterest, this.treeWidth, this.state.additionalVisibleNodes);

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
  handleNodeShowParalogs: function (node) {
    function expanded(n) {
      return !n.parent || n.parent.displayInfo.expanded;
    }
    if (!!node.displayInfo.paralogs) {
      var genetree = this.genetree;
      var additionalVisibleNodes = _.clone(this.state.additionalVisibleNodes);
      node.displayInfo.paralogs.forEach(function(paralog) {
        var parentNode = paralog.parent;
        while (!parentNode.displayInfo.expanded) {
          parentNode.displayInfo.expanded = true;
          parentNode.displayInfo.expandedBecause = 'selected'; // this happens again in layoutTree()
          additionalVisibleNodes[parentNode.model.node_id] = parentNode;
          parentNode = parentNode.parent
        }
      });
      var allVisibleNodes = layoutTree(
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
    }
  },
  render: function () {
    var genetree, alignments, height;

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
            if (geneOfInterest.homology.gene_tree.representative
              && geneOfInterest.homology.gene_tree.representative.model.id === node.model.gene_stable_id) {
              hl = '#ccffaa';
            }
            return (
              <g key={node.model.node_id} >
                <PositionedDomains key={node.model.node_id + 'd'} node={node} width={width} highlight={hl} />
                <PositionedAlignment key={node.model.node_id + 'a'} node={node} width={width} />
                <PositionedExonJunctions key={node.model.node_id + 'x'} node={node} width={width} />
              </g>
            )
          }
        });
      }
    }

    return (
      <div className="genetree-vis">
        <svg width={this.props.width} height={height}>
          <g className="tree-wrapper" transform={this.transformTree}>
            {genetree}
          </g>
          <g className="alignments-wrapper" transform={this.transformAlignments}>
            {alignments}
          </g>
        </svg>
      </div>
    );
  }
});

module.exports = TreeVis;
