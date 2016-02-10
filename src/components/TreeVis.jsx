'use strict';

var React = require('react');
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;

var GeneTree = require('./GeneTree.jsx');

var relateGeneToTree = require('../utils/relateGeneToTree');
var layoutTree = require('../utils/layoutTree');
var calculateSvgHeight = require('../utils/calculateSvgHeight');

const DEFAULT_MARGIN = 10;

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    //height: React.PropTypes.number.isRequired,
    margin: React.PropTypes.number,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      additionalVisibleNodes: {}
    };
  },
  componentWillMount: function () {
    this.initHeightAndMargin();
    this.initNodes();
    this.reinitHeight();
  },
  initHeightAndMargin: function () {
    this.margin = this.props.margin || DEFAULT_MARGIN;
    this.w = this.props.width - (2 * this.margin);

    this.transform = 'translate(' + this.margin + ', ' + this.margin + ')';
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
    visibleNodes = layoutTree(genetree, geneOfInterest, this.w / 2, this.state.additionalVisibleNodes);

    this.setState({
      geneOfInterest: geneOfInterest,
      visibleNodes: visibleNodes
    });
  },
  handleGeneSelect: function (geneNode) {
    GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
      var geneOfInterest = response.docs[0];
      this.initNodes(geneOfInterest);
      this.reinitHeight();
    }.bind(this))
  },
  handleInternalNodeSelect: function (node) {
    var additionalVisibleNodes, allVisibleNodes;
    additionalVisibleNodes = _.clone(this.state.additionalVisibleNodes);

    node.walk(function(n) {
      var id = n.model.node_id;
      if(additionalVisibleNodes[id]) {
        delete additionalVisibleNodes[id];
      } else {
        additionalVisibleNodes[id] = n;
      }
    });

    allVisibleNodes = layoutTree(
      this.genetree,
      this.state.geneOfInterest,
      this.w / 2,
      additionalVisibleNodes
    );

    this.reinitHeight();

    this.setState({
      selectedInternalNode: node,
      additionalVisibleNodes: additionalVisibleNodes,
      visibleNodes: allVisibleNodes
    });
  },
  handleNodeHover: function (node) {
    if (this.state.hoveredNode === node) {
      this.setState({hoveredNode: undefined});
    }
  },
  handleNodeUnhover: function (node) {
    this.setState({hoveredNode: node});
  },
  render: function () {
    var genetree, selections, height;

    height = this.h + (2 * this.margin);

    if (this.state.visibleNodes) {
      genetree = (
        <GeneTree nodes={this.state.visibleNodes}
                  onGeneSelect={this.handleGeneSelect}
                  onInternalNodeSelect={this.handleInternalNodeSelect}
                  onNodeHover={this.handleNodeHover}
                  onNodeUnhover={this.handleNodeUnhover}/>
      );
    }

    //selections = [];
    //if (this.state.geneOfInterest) {
    //  selections.push(
    //    <li key="gene">
    //      <h4>Gene</h4>
    //      <p>{this.state.geneOfInterest._id}</p>
    //    </li>
    //  );
    //}
    //
    //if (this.state.selectedInternalNode) {
    //  selections.push(
    //    <li key="internal-node">
    //      <h4>Internal</h4>
    //      <p>{this.state.selectedInternalNode.model.node_taxon} {this.state.selectedInternalNode.model.node_type}</p>
    //    </li>
    //  );
    //}
    //
    //if (this.state.hoveredNode) {
    //  var hoverText = this.state.hoveredNode.model.node_taxon ?
    //  this.state.hoveredNode.model.node_taxon + ' ' + this.state.hoveredNode.model.node_type :
    //  this.state.hoveredNode.model.gene_stable_id + ' ' + this.state.hoveredNode.model.system_name;
    //  selections.push(
    //    <li key="hovered-node">
    //      <h4>Hovered</h4>
    //      <p>{hoverText}</p>
    //    </li>
    //  );
    //}

    return (
      <div className="genetree-vis">
        <svg width={this.props.width} height={height}>
          <g className="tree-wrapper" transform={this.transform}>
            {genetree}
          </g>
        </svg>
        <div className="selections">
          <ul>
            {selections}
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = TreeVis;
