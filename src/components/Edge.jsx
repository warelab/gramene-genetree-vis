var React = require('react');
var scale = require('d3').scale.linear;

var Edge = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired, // child
    target: React.PropTypes.object.isRequired  // parent
  },

  hover: function () {
    console.log('hover', this.props);
  },

  unhover: function () {
    console.log('unhover', this.props);
  },

  path: function() {
    var source, target, coords;
    source = this.props.source;
    target = this.props.target;
    coords = [
      [source.y, source.x],
      [target.y, source.x],
      [target.y, target.x]
    ];

    return 'M' + coords.join(' ');
  },

  style: function() {
    var stats, colorScale, color, max, score;
    stats = _.get(this.props.source, 'relationToGeneOfInterest.taxonomy');
    max = stats.maxima.lcaDistance + stats.maxima.pathDistance;
    score = stats.lcaDistance + stats.pathDistance;
    colorScale = scale().domain([0, max]).range(['green', 'red']);
    color = colorScale(score);
    console.log(color, max, score, this.props.source);
    return {stroke: color};
  },

  render: function () {
    var path = this.path();
    var style = this.style();
    return (
      <path className="link"
            d={path}
            style={style}
            onMouseOver={this.hover}
            onMouseOut={this.unhover}/>
    )
  }
});

module.exports = Edge;