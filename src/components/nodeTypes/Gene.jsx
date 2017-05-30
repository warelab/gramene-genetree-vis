import React from 'react';
import _ from 'lodash';

const Gene = props => {
  return (
    <g className={className(props.node)}>
      <circle r="3"/>
      <text x="10"
            dy=".35em">
        {text(props.node)}
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

function text(node) {
  return  _.get(node, 'model.gene_stable_id');
}

Gene.propTypes = {
  node: React.PropTypes.object.isRequired,
  onHover: React.PropTypes.func.isRequired,
  taxonomy: React.PropTypes.object.isRequired
};

export default Gene;