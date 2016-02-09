var React = require('react');
var _ = require('lodash');

var Gene = React.createClass({
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
    if(nodeType) {
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
        <rect x="-2" y="-2" width="4" height="4"/>
        <text x="10"
              dy=".35em"
              textAnchor="start">
          {this.text()}
        </text>
      </g>
    )
  }
});

module.exports = Gene;