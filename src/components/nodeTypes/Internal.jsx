import React from 'react';
import _ from 'lodash';

const INTERNAL_NODE_SIZE = 4;
const ONE_CHILD_SIZE_RATIO = 0.8;

const Internal = props => {
  const hasOneChild = props.node.children.length == 1;
  const xy = hasOneChild ? Internal.xy * ONE_CHILD_SIZE_RATIO : Internal.xy;
  const wh = hasOneChild ? Internal.wh * ONE_CHILD_SIZE_RATIO : Internal.wh;

  return (
    <g className={className(props.node)}>
      <rect x={xy} y={xy} width={wh} height={wh}/>
      <text x="10"
            dy=".35em"
            textAnchor="start">
        {text(props.node)}
      </text>
    </g>
  )
};

function className(node) {
  let className = 'internal';
  let nodeType = _.get(node, 'model.node_type');
  if (nodeType) {
    className += ' ' + nodeType;
  }
  return className;
}

function text(node) {
  return (
    _.get(node, 'model.gene_display_label') ||
    _.get(node, 'model.gene_stable_id') ||
    ''
  );
}

Internal.propTypes = {
  node: React.PropTypes.object.isRequired,
  onHover: React.PropTypes.func.isRequired
};

Internal.xy = INTERNAL_NODE_SIZE / -2;
Internal.wh = INTERNAL_NODE_SIZE;

export default Internal;