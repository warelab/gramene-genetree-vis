var React = require('react');
var _ = require('lodash');

var Edge = require('./Edge.jsx');
var Node = require('./Node.jsx');

var GeneTree = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array.isRequired,
    onGeneSelect: React.PropTypes.func.isRequired,
    onInternalNodeSelect: React.PropTypes.func.isRequired,
    onNodeHover: React.PropTypes.func.isRequired
  },
  handleNodeSelect: function (node) {
    if (node.model.gene_stable_id) {
      this.props.onGeneSelect(node);
    }
    else {
      this.props.onInternalNodeSelect(node);
    }
  },

  handleHover: function(node) {
    this.props.onNodeHover(node);
  },

  render: function () {
    var nodes, nodeComponents, edgeComponents;
    // Compute the new tree layout.
    nodes = this.props.nodes;

    nodeComponents = nodes.map(function (node, idx) {
      return <Node key={idx}
                   node={node}
                   onSelect={this.handleNodeSelect}
                   onHover={this.handleHover}
      />;
    }.bind(this));

    edgeComponents = nodes.filter(function (n) { return n.parent })
      .map(function (node, idx) {
        return <Edge key={idx}
                     source={node}
                     target={node.parent}
                     onHover={this.handleHover}/>
      }.bind(this));

    return (
      <g className="genetree">
        <g className="nodes">
          {nodeComponents}
        </g>
        <g className="edges">
          {edgeComponents}
        </g>
      </g>
    )
  }
});

module.exports = GeneTree;