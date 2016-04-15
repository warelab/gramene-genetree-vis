'use strict';
var scale = require('d3').scale.linear;

var React = require('react');

var calculateAlignment = require('../utils/calculateAlignment');

var Alignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired
  },
  
  getInitialState: function () {
    return {};
  },

  componentWillMount: function () {
    var node = this.props.node;
    calculateAlignment(node);
  },

  render: function () {
    var node = this.props.node;
    var alignment = node.alignment;
    var colorScale = scale()
      .domain([0, alignment.nSeqs])
      .range(['lightgreen','darkgreen']);

    var k=0;
    var bins = alignment.hist.map(function(bin) {
      var w = bin.end - bin.start+1;

      var color = colorScale(bin.score);
      var style = {fill: color, stroke: color};
      k++;
      return (
        <rect key={k} width={w} height="12" x={bin.start} style={style} />
      )
    });
    var sf = this.props.width / alignment.size;
    var transform = 'scale('+ sf +' 1)';
    var border = {'fillOpacity':0, stroke:'darkgreen'};
    return (
      <g className="alignment" transform={transform}>
        {bins}
        <rect width={alignment.size} height="12" style={border} />
      </g>
    );
  }
});

module.exports = Alignment;