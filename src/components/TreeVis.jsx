var React = require('react');
var d3 = require('d3');
var _ = require('lodash');

var GeneTree = require('./GeneTree.jsx');

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    genetree: React.PropTypes.object.isRequired,
    geneOfInterest: React.PropTypes.object
  },
  getInitialState: function () {
    return {};
  },
  componentWillMount: function () {
    var initNodesDeferred = function initNodesDeferred() {
      var nodes = _.cloneDeep(this.props.genetree.all());
      this.scaleBranchLengths(nodes);
      this.setState({nodes: nodes});
    }.bind(this);
    process.nextTick(initNodesDeferred);
  },
  render: function () {
    var genetree;

    if (this.state.nodes) {
      genetree = (
        <GeneTree geneOfInterest={this.props.geneOfInterest}
                  nodes={this.state.nodes}/>
      );
    }

    return (
      <svg width={this.props.width} height={this.props.height}>
        {genetree}
      </svg>
    );
  },
  scaleBranchLengths: function scaleBranchLengths(nodes) {
    var w, h, visitPreOrder, rootDists, xscale, yscale;

    w = this.props.width;
    h = this.props.height;

    // Visit all nodes and adjust y pos width distance metric
    visitPreOrder = function (root, callback) {
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
    rootDists = nodes.map(function (n) { return n.root_dist; });
    yscale = d3.scale.linear()
      .domain([0, d3.max(rootDists)])
      .range([0, w]);
    xscale = d3.scale.linear()
      .domain([nodes[0].model.left_index, nodes[0].model.right_index])
      .range([0, h]);
    visitPreOrder(nodes[0], function (node) {
      node.x = xscale((node.model.left_index + node.model.right_index) / 2);
      node.y = yscale(node.root_dist);
    });
    return yscale;
  }
});

module.exports = TreeVis;
