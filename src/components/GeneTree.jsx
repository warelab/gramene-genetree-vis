import React from 'react';
import Clade from './Clade.jsx';

const GeneTree = props => {
  return (
    <g className="genetree">
      <Clade {...props} node={props.nodes[0]} xOffset={0} yOffset={0}/>
    </g>
  )
};

GeneTree.propTypes = {
  nodes: React.PropTypes.array.isRequired,
  onGeneSelect: React.PropTypes.func.isRequired,
  onInternalNodeSelect: React.PropTypes.func.isRequired,
  onNodeHover: React.PropTypes.func.isRequired,
  taxonomy: React.PropTypes.object
};

export default GeneTree;