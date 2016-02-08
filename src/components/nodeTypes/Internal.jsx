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
    var className, homology, repType;

    className = 'internal';
    homology = _.get(this.props.node, 'relationToGeneOfInterest.homology');
    repType = _.get(this.props.node, 'relationToGeneOfInterest.repType');
    if (homology) {
      className += ' homolog ' + homology;
    }
    if (repType) {
      className += ' representative';
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
        <circle r="3"/>
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