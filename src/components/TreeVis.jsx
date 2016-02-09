var React = require('react');
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;

var GeneTree = require('./GeneTree.jsx');

var relateGeneToTree = require('../utils/relateGeneToTree');
var layoutTree = require('../utils/layoutTree');
//var highlightClade = require('../utils/highlightClade');

const DEFAULT_MARGIN = 10;

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    margin: React.PropTypes.number,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object
  },
  getInitialState: function () {
    return {};
  },
  componentWillMount: function () {
    this.initNodesDeferred();
    this.initDimensions();
  },
  initNodesDeferred: function () {
    process.nextTick(this.initNodes);
  },
  initDimensions: function() {
    this.margin = this.props.margin || DEFAULT_MARGIN;
    this.w = this.props.width - (2 * this.margin);
    this.h = this.props.height - (2 * this.margin);

    this.transform = 'translate(' + this.margin + ', ' + this.margin + ')';
  },
  initNodes: function (geneOfInterest) {
    var genetree, visibleNodes;
    genetree = this.genetree;

    if(!genetree) {
      genetree = this.genetree = _.cloneDeep(this.props.genetree);
    }
    geneOfInterest = geneOfInterest || this.props.initialGeneOfInterest;

    relateGeneToTree(genetree, geneOfInterest, this.props.taxonomy);
    visibleNodes = layoutTree(genetree, geneOfInterest, this.w / 2, this.h);

    this.setState({
      geneOfInterest: geneOfInterest,
      visibleNodes: visibleNodes
    });
  },
  handleGeneSelect: function (geneNode) {
    GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
      var geneOfInterest = response.docs[0];
      this.initNodes(geneOfInterest);
    }.bind(this))
  },
  handleInternalNodeSelect: function (node) {
    //highlightClade(this.genetree, node, 'select');
    this.setState({selectedInternalNode: node});
  },
  handleNodeHover: function (node) {
    //highlightClade(this.genetree, node, 'hover');
    if(this.state.hoveredNode === node) {
      this.setState({hoveredNode: undefined});
    }
  },
  handleNodeUnhover: function (node) {
    //highlightClade(this.genetree, node, 'unhover');
    this.setState({hoveredNode: node});
  },
  render: function () {
    var genetree, selections;

    if (this.state.visibleNodes) {
      genetree = (
        <GeneTree nodes={this.state.visibleNodes}
                  onGeneSelect={this.handleGeneSelect}
                  onInternalNodeSelect={this.handleInternalNodeSelect}
                  onNodeHover={this.handleNodeHover}
                  onNodeUnhover={this.handleNodeUnhover}/>
      );
    }

    selections = [];
    if (this.state.geneOfInterest) {
      selections.push(
        <li key="gene">
          <h4>Gene</h4>
          <p>{this.state.geneOfInterest._id}</p>
        </li>
      );
    }

    if (this.state.selectedInternalNode) {
      selections.push(
        <li key="internal-node">
          <h4>Internal</h4>
          <p>{this.state.selectedInternalNode.model.node_taxon} {this.state.selectedInternalNode.model.node_type}</p>
        </li>
      );
    }

    if (this.state.hoveredNode) {
      var hoverText = this.state.hoveredNode.model.node_taxon ?
      this.state.hoveredNode.model.node_taxon + ' ' + this.state.hoveredNode.model.node_type :
      this.state.hoveredNode.model.gene_stable_id + ' ' + this.state.hoveredNode.model.system_name;
      selections.push(
        <li key="hovered-node">
          <h4>Hovered</h4>
          <p>{hoverText}</p>
        </li>
      );
    }

    return (
      <div className="genetree-vis">
        <svg width={this.props.width} height={this.props.height}>
          <g className="margin" transform={this.transform}>
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
