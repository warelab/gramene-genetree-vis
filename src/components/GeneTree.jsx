var React = require('react');
var _ = require('lodash');

var Edge = require('./Edge.jsx');
var Node = require('./Node.jsx');

var GeneTree = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array.isRequired,
    parentIsHovered: React.PropTypes.bool,
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

      getInitialState: function() {
        return {};
      },

      componentWillMount: function() {
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.onSelect = this.props.node.model.gene_stable_id ? geneTreeProps.onGeneSelect : geneTreeProps.onInternalNodeSelect;
      },

      handleClick: function (e) {
        e.stopPropagation();
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.onSelect(this.props.node);
      },

      hover: function (e) {
        e.stopPropagation();
        //noinspection JSPotentiallyInvalidUsageOfThis
        geneTreeProps.onNodeHover(this.props.node);
        this.setState({hovered: true});
      },

      unhover: function (e) {
        e.stopPropagation();
        //noinspection JSPotentiallyInvalidUsageOfThis
        geneTreeProps.onNodeUnhover(this.props.node);
        this.setState({hovered: false});
      },

      render: function() {
        var node, parent, children, hovered, subClades, nodeComponent, edgeComponent;

        //noinspection JSPotentiallyInvalidUsageOfThis
        node = this.props.node;
        parent = node.parent;
        children = node.children;
        hovered = this.state.hovered;

        if(_.isArray(children) && node.displayInfo.expanded) {
          subClades = children.map(function(childNode, idx) {
            return <Clade key={idx} node={childNode} parentIsHovered={hovered} />
          });
        }

        nodeComponent = (
          <Node node={node}
                onSelect={this.onSelect} />
        );

        if(parent) {
          //noinspection JSPotentiallyInvalidUsageOfThis
          var shortenEdge = !!this.props.parentIsHovered;
          edgeComponent = (
            <Edge source={node}
                  target={parent}
                  shortenEdge={shortenEdge} />
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