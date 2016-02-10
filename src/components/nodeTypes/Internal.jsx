'use strict';

var React = require('react');
var _ = require('lodash');

const INTERNAL_NODE_SIZE = 4;

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
    return (
      <g className={this.className()}>
        <rect x={Internal.xy} y={Internal.xy} width={Internal.wh} height={Internal.wh}/>
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