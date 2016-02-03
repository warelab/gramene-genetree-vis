var React = require('react');
var d3 = require('d3');
var _ = require('lodash');

var Edge = require('./Edge.jsx');
var Node = require('./Node.jsx');

var GeneTree = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array.isRequired,
    geneOfInterest: React.PropTypes.object
  },
  render: function () {
    var nodes, nodeComponents, edgeComponents;
    // Compute the new tree layout.
    nodes = this.props.nodes;

    nodeComponents = nodes.map(function (node, idx) {
      node.id = 'Node' + idx;
      return <Node key={node.id}
                   node={node}
                   geneOfInterest={this.props.geneOfInterest}/>;
    }.bind(this));

    edgeComponents = nodes.filter(function (n) { return n.parent })
      .map(function (node, idx) {
        return <Edge key={node.id}
                     source={node}
                     target={node.parent}
                     geneOfInterest={this.props.geneOfInterest}/>
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