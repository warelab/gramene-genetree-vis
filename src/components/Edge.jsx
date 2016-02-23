'use strict';

var React = require('react');

var taxonomyColor = require('../utils/taxonomyColor');
var defaultXAdjust = require('./nodeTypes/Internal.jsx').xy;

// see CSS selector ".node:hover .internal"
const HOVER_SCALE_FACTOR = 2;

var Edge = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired, // child
    target: React.PropTypes.object.isRequired,  // parent
    cladeHovered: React.PropTypes.bool.isRequired,
    thisCladeHovered: React.PropTypes.bool.isRequired
  },

  pathCoords: function () {
    var source, target, shouldAdjust, xAdjust, adjustedTargetX;
    source = this.props.source;
    target = this.props.target;
    shouldAdjust = this.props.cladeHovered && !this.props.thisCladeHovered;

    // stop drawing the egde before it overlaps the parent node
    // (the child edge is always drawn after the parent node)
    xAdjust = shouldAdjust ? defaultXAdjust * HOVER_SCALE_FACTOR : defaultXAdjust;
    adjustedTargetX = source.x > target.x ? target.x - xAdjust : target.x + xAdjust;

    return [
      [0, 0],
      [target.y - source.y, 0],
      [target.y - source.y, adjustedTargetX - source.x]
    ];
  },

  transform: function(c1, c2, size) {
    var offset, transform, x1, x2, y1, y2, shouldScaleX;
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
    if(shouldScaleX) {
      transform = 'translate(' + (x2 - offset) + 'px, '
        + (y2 - offset) + 'px) '
        + 'scaleX(' + (x1 - x2 + offset) + ') ';

      if(size !== 1) {
        transform += 'scaleY(' + size + ') ';
      }
    }
    // otherwise, scaleY
    else {
      transform = 'translate('
        + (x2 - offset) + 'px, '
        + y2 + 'px) '
        + 'scaleY('+  (y1 - y2) + ')';

      if(size !== 1) {
        transform += 'scaleX(' + size + ') ';
      }
    }

    return transform;
  },

  rect: function (c1, c2, className, size) {
    var t, props;

    t = this.transform(c1, c2, size);

    props = {
      className: className,
      style: {
        fill: taxonomyColor(this.props.source),
        transform: t
      },
      x: 0,
      y: 0,
      width: 1,
      height: 1
    };

    return (
      <rect {...props} />
    );
  },

  edge: function() {
    const coords = this.pathCoords();
    const className = 'edge-rect';
    const size = this.props.cladeHovered ?
                    Edge.width.hovered :
                    Edge.width.edge;

    return (
      <g>
        {this.rect(coords[0], coords[1], className, size)}
        {this.rect(coords[1], coords[2], className, size)}
      </g>
    );
  },

  interactionHelper: function () {
    const coords = this.pathCoords();
    const className = 'interaction-rect';
    const size = Edge.width.helper;

    return (
      <g className="interaction-helper">
        {this.rect(coords[0], coords[1], className, size)}
        {this.rect(coords[1], coords[2], className, size)}
      </g>
    );
  },

  render: function () {
    return (
      <g className="edge">
        {this.interactionHelper()}
        {this.edge()}
      </g>
    );
  }
});

Edge.width = {
  edge: 1,
  hovered: 2,
  helper: 4
};

module.exports = Edge;