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
    shortenEdge: React.PropTypes.bool.isRequired  // parent
    //onHover: React.PropTypes.func.isRequired,
    //onUnhover: React.PropTypes.func.isRequired
  },

  pathCoords: function () {
    var source, target, xAdjust, adjustedTargetX;
    source = this.props.source;
    target = this.props.target;

    // stop drawing the egde before it overlaps the parent node
    // (the child edge is always drawn after the parent node)
    xAdjust = this.props.shortenEdge ? defaultXAdjust * HOVER_SCALE_FACTOR : defaultXAdjust;
    adjustedTargetX = source.x > target.x ? target.x - xAdjust : target.x + xAdjust;

    return [
      [0, 0],
      [target.y - source.y, 0],
      [target.y - source.y, adjustedTargetX - source.x]
    ];
  },

  transform: function(c1, c2, size) {
    var offset, transform;
    size = size || 1;
    offset = size / 2;

    // either the x coords (index 0) or y coords (index 1)
    // will differ.

    // if x coords differ, scaleX
    if(c1[0] !== c2[0]) {
      transform = 'translate(' + c2[0] + 'px, '
        + (c2[1] - offset) + 'px) '
        + 'scaleX(' + (c1[0] - c2[0]) + ') ';

      if(size !== 1) {
        transform += 'scaleY(' + size + ') ';
      }
    }
    // otherwise, scaleY
    else {
      transform = 'translate('
        + (c2[0] - offset) + 'px, '
        + c2[1] + 'px) '
        + 'scaleY('+  (c1[1] - c2[1]) + ')';

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
    const size = 1;

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
    const size = 3;

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

module.exports = Edge;