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

  componentWillMount: function() {
    var Clade, geneTreeProps;
    geneTreeProps = this.props;

    Clade = this.Clade = React.createClass({
      propTypes: {
        node: React.PropTypes.object.isRequired
      },
      render: function() {
        var node, parent, children, onSelect, subClades, nodeComponent, edgeComponent;

        //noinspection JSPotentiallyInvalidUsageOfThis
        node = this.props.node;
        parent = node.parent;
        children = node.children;

        onSelect = node.model.gene_stable_id ? geneTreeProps.onGeneSelect : geneTreeProps.onInternalNodeSelect;

        if(_.isArray(children) && node.displayInfo.expanded) {
          subClades = children.map(function(childNode, idx) {
            return <Clade key={idx} node={childNode} />
          });
        }

        nodeComponent = (
          <Node node={node}
                onSelect={onSelect}
                onHover={geneTreeProps.onNodeHover}
                onUnhover={geneTreeProps.onNodeUnhover} />
        );

        if(parent) {
          edgeComponent = (
            <Edge source={node}
                  target={parent}
                  onHover={geneTreeProps.onNodeHover}
                  onUnhover={geneTreeProps.onNodeUnhover} />
          );
        }

        return (
          <g className="clade">
            {nodeComponent}
            {edgeComponent}
            {subClades}
          </g>
        );
      }
    });
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
    var Clade = this.Clade;

    return (
      <g className="genetree">
        <Clade node={this.props.nodes[0]} />
      </g>
    )
  }
});

module.exports = GeneTree;