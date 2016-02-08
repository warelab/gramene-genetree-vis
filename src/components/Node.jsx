var React = require('react');
var _ = require('lodash');

var Collapsed = require('./nodeTypes/Collapsed.jsx');
var Internal = require('./nodeTypes/Internal.jsx');
var Gene = require('./nodeTypes/Gene.jsx');

var Node = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      hovered: false
    }
  },

  handleClick: function () {
    console.log('clicked', this.props);
    this.props.onSelect(this.props.node);
  },

  hover: function () {
    console.log('hover', this.props);
    this.props.onHover(this.props.node);
    this.setState({hovered: true});
  },

  unhover: function () {
    console.log('unhover', this.props);
    this.setState({hovered: false});
  },

  transform: function () {
    return 'translate(' + this.props.node.y + ', ' + this.props.node.x + ')';
  },

  className: function () {
    var className, homology, repType;

    className = 'node';
    if (this.state.hovered) {
      className += ' hover';
    }
    return className;
  },

  render: function () {
    var node, component;
    node = this.props.node;
    if (node.model.gene_stable_id) {
      component = Gene;
    }
    else if (!node.displayInfo.expanded) {
      component = Collapsed;
    }
    else {
      component = Internal;
    }

    return (
      <g className={this.className()}
         transform={this.transform()}
         onClick={this.handleClick}
         onMouseOver={this.hover}
         onMouseOut={this.unhover}>
        {React.createElement(component, {node: node})}
      </g>
    )
  }
});

module.exports = Node;