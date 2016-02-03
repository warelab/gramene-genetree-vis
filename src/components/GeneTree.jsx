var React = require('react');
var d3 = require('d3');
var _ = require('lodash');

var Edge = require('./Edge.jsx');
var Node = require('./Node.jsx');

var GeneTree = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    genetree: React.PropTypes.object.isRequired,
    geneOfInterest: React.PropTypes.object
  },
  componentWillMount: function () {
    this.tree = d3.layout.tree()
      .size([this.props.height, this.props.width]);
  },
  render: function () {
    var nodes, nodeComponents, edgeComponents;
    // Compute the new tree layout.
    nodes = this.tree.nodes(this.props.genetree);

    scaleBranchLengths(nodes, this.props.width, this.props.height);

    nodeComponents = nodes.map(function (node, idx) {
      node.id = 'Node' + idx;
      return <Node key={node.id}
                   node={node}
                   gene={this.props.geneOfInterest}/>;
    }.bind(this));

    edgeComponents = nodes.filter(function (n) { return n.parent })
      .map(function (node, idx) {
        return <Edge key={node.id}
                     source={node}
                     target={node.parent}
                     gene={this.props.geneOfInterest}/>
      }.bind(this));

    return (
      <svg width={this.props.width}
           height={this.props.height}>
        <g>
          {nodeComponents}
          {edgeComponents}
        </g>
      </svg>
    );
  }
});

module.exports = GeneTree;

function scaleBranchLengths(nodes, w, h) {
  // Visit all nodes and adjust y pos width distance metric
  var visitPreOrder = function (root, callback) {
    callback(root);
    if (root.children) {
      for (var i = root.children.length - 1; i >= 0; i--) {
        visitPreOrder(root.children[i], callback)
      }
    }
  };
  visitPreOrder(nodes[0], function (node) {
    node.root_dist = (node.parent ? node.parent.root_dist : 0) + (Math.max(node.model.distance_to_parent, 0.02) || 0)
    console.log(node, Math.max(node.model.distance_to_parent, 0.02));
  });
  var rootDists = nodes.map(function (n) { return n.root_dist; });
  var yscale = d3.scale.linear()
    .domain([0, d3.max(rootDists)])
    .range([0, w]);
  var xscale = d3.scale.linear()
    .domain([nodes[0].model.left_index, nodes[0].model.right_index])
    .range([0, h]);
  visitPreOrder(nodes[0], function (node) {
    node.x = xscale((node.model.left_index + node.model.right_index) / 2);
    node.y = yscale(node.root_dist);
  });
  return yscale;
}
