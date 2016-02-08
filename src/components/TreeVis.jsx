var React = require('react');
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;

var GeneTree = require('./GeneTree.jsx');

var relateGeneToTree = require('../utils/relateGeneToTree');
var layoutTree = require('../utils/layoutTree');

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object
  },
  getInitialState: function () {
    return {};
  },
  componentWillMount: function () {
    this.initNodesDeferred();
  },
  initNodesDeferred: function () {
    process.nextTick(this.initNodes);
  },
  initNodes: function (geneOfInterest) {
    var genetree, visibleNodes;
    genetree = this.genetree;
    if(!genetree) {
      genetree = this.genetree = _.cloneDeep(this.props.genetree);
    }
    //genetree.walk(function (n, idx) {
    //  n.idx = idx;
    //  return n;
    //});
    geneOfInterest = geneOfInterest || this.props.initialGeneOfInterest;

    relateGeneToTree(genetree, geneOfInterest, this.props.taxonomy);
    visibleNodes = layoutTree(genetree, geneOfInterest, this.props.width / 2, this.props.height);

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
    this.setState({selectedInternalNode: node});
  },
  handleNodeHover: function (node) {
    this.setState({hoveredNode: node});
  },
  render: function () {
    var genetree, selections;

    if (this.state.visibleNodes) {
      genetree = (
        <GeneTree nodes={this.state.visibleNodes}
                  onGeneSelect={this.handleGeneSelect}
                  onInternalNodeSelect={this.handleInternalNodeSelect}
                  onNodeHover={this.handleNodeHover}/>
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
        <div className="selections">
          <ul>
            {selections}
          </ul>
        </div>
        <svg width={this.props.width} height={this.props.height}>
          {genetree}
        </svg>
      </div>
    );
  }
});

module.exports = TreeVis;
