import React from 'react';
import PropTypes from 'prop-types';
import Clade from './Clade.js';

const GeneTree = props => {
  return (
    <g className="genetree">
      <Clade {...props} node={props.nodes[0]} xOffset={0} yOffset={0}/>
    </g>
  )
};

GeneTree.propTypes = {
  nodes: PropTypes.array.isRequired,
  labelFields: PropTypes.array.isRequired,
  onGeneSelect: PropTypes.func.isRequired,
  onNodeHover: PropTypes.func.isRequired,
  taxonomy: PropTypes.object
};

export default GeneTree;