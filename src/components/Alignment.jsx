'use strict';
var scale = require('d3').scale.linear;

var React = require('react');

var Alignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    alignment: React.PropTypes.object.isRequred
  },
  
  render: function () {
    var node = this.props.node;
    var alignment = this.props.alignment;

    var colorScale = scale()
      .domain([0, alignment.nSeqs])
      .range(['lightgreen','darkgreen']);

    var k=0;
    var bins = [];
    var offsets = Object.keys(alignment.hist).map(function(i) { return +i }).sort(function(a,b){return a - b});
    var depth=0;
    for(var i=0; i<offsets.length - 1; i++) {
      depth += alignment.hist[offsets[i]];
      if (depth > 0) {
        var w = offsets[i+1] - offsets[i] + 1;
        var color = colorScale(depth);
        var style = {fill: color, stroke: false};
        var s = offsets[i];
        k++;
        var rect = (
          <rect key={k} width={w} height="14" x={s} style={style} />
        );
        bins.push(rect);
      }
    }
    var sf = this.props.width / alignment.size;
    var transform = 'scale('+ sf +' 1)';
    return (
      <g className="alignment" transform={transform}>
        {bins}
      </g>
    );
  }
});

module.exports = Alignment;