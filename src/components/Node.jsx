import React from 'react';
import PropTypes from 'prop-types';

import Collapsed from './nodeTypes/Collapsed.jsx';
import Internal from './nodeTypes/Internal.jsx';
import Gene from './nodeTypes/Gene.jsx';

const Node = props => {
  return (
    <g className="node">
      <rect className="interaction-helper" x="-5" y="-5" width="10" height="10"/>
      {React.createElement(getNodeComponent(props.node), props)}
    </g>
  )
};

function getNodeType(node) {
  if (node.model.gene_stable_id) {
    return 'Gene';
  }
  else if (!node.displayInfo.expanded) {
    return 'Collapsed';
  }
  else {
    return 'Internal';
  }
}
  
function getNodeComponent(node) {
  switch(getNodeType(node)) {
    case 'Gene': return Gene;
    case 'Collapsed': return Collapsed;
    case 'Internal': return Internal;
  }
}


Node.propTypes = {
  node: PropTypes.object.isRequired,
  taxonomy: PropTypes.object.isRequired
};

export default Node;