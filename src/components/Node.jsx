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
    onHover: React.PropTypes.func.isRequired,
    onUnhover: React.PropTypes.func.isRequired
  },

  componentWillMount: function() {
    this.initNodeComponent();
  },

  initNodeComponent: function() {
    var node = this.props.node;

    if (node.model.gene_stable_id) {
      this.nodeTypeComponent = Gene;
    }
    else if (!node.displayInfo.expanded) {
      this.nodeTypeComponent = Collapsed;
    }
    else {
      this.nodeTypeComponent = Internal;
    }
  },

  getInitialState: function () {
    return {};
  },

  handleClick: function () {
    this.props.onSelect(this.props.node);
  },

  hover: function () {
    this.props.onHover(this.props.node);
  },

  unhover: function () {
    this.props.onUnhover(this.props.node);
  },

  transform: function () {
    return 'translate(' + this.props.node.y + ', ' + this.props.node.x + ')';
  },

  className: function () {
    var className;

    className = 'node';

    return className;
  },

  render: function () {
    return (
      <g className={this.className()}
         transform={this.transform()}
         onClick={this.handleClick}
         onMouseOver={this.hover}
         onMouseOut={this.unhover}>
        <rect className="interaction-helper" x="-5" y="-5" width="10" height="10"/>
        {React.createElement(this.nodeTypeComponent, {node: this.props.node})}
      </g>
    )
  }
});

module.exports = Node;