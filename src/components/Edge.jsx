var React = require('react');
var _ = require('lodash');
var scale = require('d3').scale.linear;

var xAdjust = require('./nodeTypes/Internal.jsx').xy;

var Edge = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired, // child
    target: React.PropTypes.object.isRequired  // parent
    //onHover: React.PropTypes.func.isRequired,
    //onUnhover: React.PropTypes.func.isRequired
  },

  path: function () {
    var source, target, adjustedTargetX, coords;
    source = this.props.source;
    target = this.props.target;

    // stop drawing the egde before it overlaps the parent node
    // (the child edge is always drawn after the parent node)
    adjustedTargetX = source.x > target.x ? target.x - xAdjust : target.x + xAdjust;

    coords = [
      [source.y, source.x],
      [target.y, source.x],
      [target.y, adjustedTargetX]
    ];

    return 'M' + coords.join(' ');
  },

  style: function () {
    var stats, colorScale, color, max, score;
    stats = _.get(this.props.source, 'relationToGeneOfInterest.taxonomy');
    max = stats.maxima.lcaDistance + stats.maxima.pathDistance;
    score = stats.lcaDistance + stats.pathDistance;
    colorScale = scale().domain([0, max]).range(['green', 'red']);
    color = colorScale(score);
    return {stroke: color};
  },

  render: function () {
    var path = this.path();
    var style = this.style();
    return (
      <g className="edge">
        <path className="interaction-helper"
              d={path} />
        <path className="link"
              d={path}
              style={style} />
      </g>
    )
  }
});

module.exports = Edge;