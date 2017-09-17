import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const Gene = props => {
  return (
    <g className={className(props.node)}>
      <circle r="3"/>
      <text x="10"
            dy=".35em">
        {text(props).join('; ')}
      </text>
    </g>
  )
};

function className(node) {
  let className, homology, repType;

  className = 'gene';
  homology = _.get(node, 'relationToGeneOfInterest.homology');
  repType = _.get(node, 'relationToGeneOfInterest.repType');
  if (homology) {
    className += ' homolog ' + homology;
  }
  if (repType) {
    className += ' representative';
  }
  return className;
}

function text(props) {
  return props.labelFields.map((field) => { return _.get(props.node, field)}); //'model.gene_stable_id');
}

Gene.propTypes = {
  node: PropTypes.object.isRequired,
  labelFields: PropTypes.array.isRequired,
  onHover: PropTypes.func.isRequired,
  taxonomy: PropTypes.object.isRequired
};

export default Gene;