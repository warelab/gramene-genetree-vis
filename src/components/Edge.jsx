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
      [source.y, source.x],
      [target.y, source.x],
      [target.y, adjustedTargetX]
    ];
  },

  path: function () {
    return 'M' + this.pathCoords().join(' ');
  },

  interactionRect: function (c1, c2) {
    var props = {
      x: Math.min(c1[0], c2[0]) - 1,
      y: Math.min(c1[1], c2[1]) - 1,
      width: Math.abs(c1[0] - c2[0]) + 2,
      height: Math.abs(c1[1] - c2[1]) + 2
    };
    return (
      <rect {...props} />
    );
  },

  interactionHelper: function () {
    var coords, rect1, rect2;

    coords = this.pathCoords();
    rect1 = this.interactionRect(coords[0], coords[1]);
    rect2 = this.interactionRect(coords[1], coords[2]);

    return (
      <g className="interaction-helper">
        {rect1}
        {rect2}
      </g>
    )
  },

  style: function () {
    return {stroke: taxonomyColor(this.props.source)};
  },

  render: function () {
    return (
      <g className="edge">
        {this.interactionHelper()}
        <path className="link"
              d={this.path()}
              style={this.style()}/>
      </g>
    )
  }
});

module.exports = Edge;