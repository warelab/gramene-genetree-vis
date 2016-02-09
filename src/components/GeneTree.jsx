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

    //noinspection JSUnusedAssignment
    Clade = this.Clade = React.createClass({
      propTypes: {
        node: React.PropTypes.object.isRequired
      },

      componentWillMount: function() {
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.onSelect = this.props.node.model.gene_stable_id ? geneTreeProps.onGeneSelect : geneTreeProps.onInternalNodeSelect;
      },

      handleClick: function () {
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.onSelect(this.props.node);

      },

      hover: function () {
        //noinspection JSPotentiallyInvalidUsageOfThis
        geneTreeProps.onNodeHover(this.props.node);

      },

      unhover: function () {
        //noinspection JSPotentiallyInvalidUsageOfThis
        geneTreeProps.onNodeUnhover(this.props.node);

      },

      render: function() {
        var node, parent, children, subClades, nodeComponent, edgeComponent;

        //noinspection JSPotentiallyInvalidUsageOfThis
        node = this.props.node;
        parent = node.parent;
        children = node.children;

        if(_.isArray(children) && node.displayInfo.expanded) {
          subClades = children.map(function(childNode, idx) {
            return <Clade key={idx} node={childNode} />
          });
        }

        nodeComponent = (
          <Node node={node}
                onSelect={this.onSelect} />
        );

        if(parent) {
          edgeComponent = (
            <Edge source={node}
                  target={parent} />
          );
        }

        return (
          <g className="clade"
            onMouseOver={this.hover}
            onMouseOut={this.unhover}
            onClick={this.handleClick}>
            {edgeComponent}
            {nodeComponent}
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