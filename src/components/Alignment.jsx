'use strict';
var scale = require('d3').scale.linear;

var React = require('react');
var _ = require('lodash');
var calculateAlignment = require('../utils/calculateAlignment');

var Alignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired
  },
  
  rescaleAlignment: function (width) {
    var alignment = _.cloneDeep(this.fullAlignment);
    if (alignment.size >= 2*width) {
      var binSize = Math.floor(alignment.size/width);
      function calcBin(pos) {
        return Math.floor(pos/binSize)*binSize;
      }
      var positions = []; // Thanks for the sparse arrays JavaScript! Merging histograms is easy
      alignment.hist.forEach(function(region) {
        function updatePosition(positions, offset, value) {
          if (!positions[offset]) positions[offset] = value;
          else                    positions[offset] += value;
        }
        var bin1 = calcBin(region.start);
        var bin2 = calcBin(region.end);
        if (bin2 == bin1) {
          bin2 += binSize
        }
        updatePosition(positions, bin1, region.score);
        updatePosition(positions, bin2, -region.score);
      });
      var histogram = [];
      var depth = 0;
      var offsets = Object.keys(positions).map(function(i) { return +i }).sort(function(a,b){return a - b});
      for (var i = 0; i<offsets.length - 1; i++) {
        depth += positions[offsets[i]];
        if (depth > 0) {
          histogram.push({
            start: offsets[i],
            end: offsets[i+1],
            score: depth
          });
        }
      }
      alignment.hist = histogram;
    }
    return alignment;
  },

  componentWillReceiveProps: function(newProps) {
    if (newProps.width !== this.props.width) {
      this.setState({
        alignment: this.rescaleAlignment(newProps.width)
      });
    }
  },

  getInitialState: function () {
    this.fullAlignment = calculateAlignment(this.props.node);
    return {
      alignment : this.rescaleAlignment(this.props.width)
    };
  },

  render: function () {
    var node = this.props.node;
    var alignment = this.state.alignment;
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
        <rect key={k} width={w} height="8" x={bin.start} style={style} />
      )
    });
    var sf = this.props.width / alignment.size;
    var transform = 'scale('+ sf +' 1)';
    var border = {stroke:'green'};
    return (
      <g className="alignment" transform={transform}>
        {bins}
      </g>
    );
  }
});

module.exports = Alignment;