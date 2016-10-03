'use strict';

var React = require('react');
var _ = require('lodash');

const INTERNAL_NODE_SIZE = 4;
const ONE_CHILD_SIZE_RATIO = 0.8;

var Internal = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired
  },

  className: function () {
    var className, nodeType;

    className = 'internal';
    nodeType = _.get(this.props.node, 'model.node_type');
    if (nodeType) {
      className += ' ' + nodeType;
    }
    return className;
  },

  text: function () {
    return (
      _.get(this.props.node, 'model.gene_display_label') ||
      _.get(this.props.node, 'model.gene_stable_id') ||
      ''
    );
  },

  render: function () {
    const hasOneChild = this.props.node.children.length == 1;
    const xy = hasOneChild ? Internal.xy * ONE_CHILD_SIZE_RATIO : Internal.xy;
    const wh = hasOneChild ? Internal.wh * ONE_CHILD_SIZE_RATIO : Internal.wh;

    return (
      <g className={this.className()}>
        <rect x={xy} y={xy} width={wh} height={wh}/>
        <text x="10"
              dy=".35em"
              textAnchor="start">
          {this.text()}
        </text>
      </g>
    )
  }
});

Internal.xy = INTERNAL_NODE_SIZE / -2;
Internal.wh = INTERNAL_NODE_SIZE;

module.exports = Internal;