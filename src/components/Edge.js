import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import microsoftBrowser from '../utils/microsoftBrowser';
import taxonomyColor from '../utils/taxonomyColor';
import Internal from './nodeTypes/Internal.js';
let defaultXAdjust = Internal.xy;

// see CSS selector ".node:hover .internal"
const HOVER_SCALE_FACTOR = 2;

const Edge = props => {
  return (
    <g className="edge">
      {interactionHelper(props)}
      {edge(props)}
    </g>
  );
};

function pathCoords(props) {
  let adjustedTarget, path;
  let source =props.source;
  let target = props.target;
  let shouldAdjust = props.cladeHovered && !props.thisCladeHovered;
  let yDoesntChange = _.get(target, 'model.children.length') === 1;

  // stop drawing the edge before it overlaps the parent node
  // (the child edge is always drawn after the parent node)
  let adjust = shouldAdjust ? defaultXAdjust * HOVER_SCALE_FACTOR : defaultXAdjust;

  if (yDoesntChange) {
    adjustedTarget = target.y - adjust;
    path = [
      [0, 0],
      [adjustedTarget - source.y, 0]
    ];
  }
  else {
    adjustedTarget = source.x > target.x ? target.x - adjust : target.x + adjust;
    path = [
      [0, 0],
      [target.y - source.y, 0],
      [target.y - source.y, adjustedTarget - source.x]
    ];
  }

  return path;
};

function transform(c1, c2, size, isStyle) {
  let px, offset, transform, x1, x2, y1, y2, shouldScaleX;
  px = isStyle ? 'px' : '';
  size = size || 1;
  offset = size / 2;
  x1 = c1[0];
  y1 = c1[1];
  x2 = c2[0];
  y2 = c2[1];
  shouldScaleX = x1 !== x2;

  // either the x coords (index 0) or y coords (index 1)
  // will differ.

  // if x coords differ, scaleX
  if (shouldScaleX) {
    transform = 'translate(' + (x2 - offset) + px + ', '
        + (y2 - offset) + px + ') '
        + 'scale(' + (x1 - x2 + offset) + ', ' + size + ') ';
  }
  // otherwise, scaleY
  else {
    transform = 'translate('
        + (x2 - offset) + px + ', '
        + y2 + px + ') '
        + 'scale(' + size + ', ' + (y1 - y2) + ')';
  }

  return transform;
}

function rect(c1, c2, className, size, color) {
  // if either coordinate is missing, don't draw the rectangle.
  if(!c1 || !c2) {
    return;
  }

  let props = {
    className: className,
    style: {
      fill: color
    },
    x: 0,
    y: 0,
    width: 1,
    height: 1
  };

  if (microsoftBrowser) {
    props.transform = transform(c1, c2, size, false);
  }
  else {
    props.style.transform = transform(c1, c2, size, true);
  }

  return (
      <rect {...props} />
  );
}

function edge(props) {
  const coords = pathCoords(props);
  const className = 'edge-rect';
  const size = props.cladeHovered ?
      Edge.width.hovered :
      Edge.width.edge;
  const color = taxonomyColor(props.source);

  return (
      <g>
        {rect(coords[0], coords[1], className, size, color)}
        {rect(coords[1], coords[2], className, size, color)}
      </g>
  );
}

function interactionHelper(props) {
  const coords = pathCoords(props);
  const className = 'interaction-rect';
  const size = Edge.width.helper;
  const color = taxonomyColor(props.source);
  return (
      <g className="interaction-helper">
        {rect(coords[0], coords[1], className, size, color)}
        {rect(coords[1], coords[2], className, size, color)}
      </g>
  );
}

Edge.propTypes = {
  source: PropTypes.object.isRequired, // child
  target: PropTypes.object.isRequired,  // parent
  cladeHovered: PropTypes.bool.isRequired,
  thisCladeHovered: PropTypes.bool.isRequired
};


Edge.width = {
  edge: 1,
  hovered: 2,
  helper: 4
};

export default Edge;