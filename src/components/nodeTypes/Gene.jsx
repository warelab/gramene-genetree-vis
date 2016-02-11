'use strict';

var React = require('react');
var _ = require('lodash');

var Gene = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired,
    taxonomy: React.PropTypes.object.isRequired
  },

  className: function () {
    var className, homology, repType;

    className = 'gene';
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
    var geneId, taxonId, species;
    geneId =
      _.get(this.props.node, 'model.gene_display_label') ||
      _.get(this.props.node, 'model.gene_stable_id');

    if(geneId.length < 8) {
      taxonId = this.props.node.model.taxon_id;
      species = _.get(this.props.taxonomy.indices.id[taxonId], 'model.name');
      return species + ': ' + geneId;
    }
    else {
      return geneId;
    }
  },

  render: function () {
    return (
      <g className={this.className()}>
        <circle r="3"/>
        <text x="10"
              dy=".35em">
          {this.text()}
        </text>
      </g>
    )
  }
});

module.exports = Gene;