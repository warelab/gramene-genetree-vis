'use strict';
var scale = require('d3').scale.linear;

var React = require('react');
var positionDomains = require('../utils/positionDomains');

var Alignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    stats: React.PropTypes.object.isRequired,
    highlight: React.PropTypes.string.isRequired,
    alignment: React.PropTypes.object.isRequred
  },

  getInitialState: function () {
    return {
      domains: positionDomains(this.props.node)
    };
  },
  
  getColorMap: function(alignment,stats) {
    var regionColor = [];
    var grayScale = scale().domain([0, alignment.nSeqs]).range(['#DDDDDD','#222222']);
    var prevEnd=0;
    if (this.state.domains.length > 0) {
      this.state.domains.forEach(function(d) {
        if (d.start > prevEnd+1) {
          regionColor.push({
            start: prevEnd+1,
            end: d.start-1,
            color: grayScale
          });
        }
        prevEnd = d.end;
        var maxColor = stats[d.id].color;
        var colorScale = scale().domain([0,1]).range(['#FFFFFF', maxColor]);
        regionColor.push({
          start: d.start,
          end: d.end,
          color: scale().domain([0, alignment.nSeqs]).range([colorScale(0.5), maxColor])
        })
      })
    }
    if (prevEnd < alignment.size) {
      regionColor.push({
        start: prevEnd+1,
        end: alignment.size,
        color: grayScale
      })
    }
    return regionColor;
  },
  
  renderHighlight: function () {
    if (this.props.highlight) {
      var hlStyle = {fill: this.props.highlight, stroke: false};
      var u = this.props.alignment.size / this.props.width;
      var w = 4 * u;
      var s = -w -u;
      return (
        <rect key='highlight'
              x={s}
              width={w}
              height="18"
              style={hlStyle}/>
      );
    }
  },
  
  render: function () {
    var node = this.props.node;
    var alignment = this.props.alignment;
    var regionColor = this.getColorMap(alignment,this.props.stats);

    var k=0;
    var bins = [];
    var offsets = Object.keys(alignment.hist).map(function(i) { return +i }).sort(function(a,b){return a - b});
    var depth=0;
    var regionIdx=0;
    for(var i=0; i<offsets.length - 1; i++) {
      depth += alignment.hist[offsets[i]];
      if (depth > 0) {
        function renderBlock(block) {
          var style = {fill: block.color, stroke: false};
          var s = block.start;
          var w = block.end - block.start + 1;
          k++;
          var rect = (
            <rect key={k} width={w} height="14" x={s} style={style} />
          );
          return rect;
        }
        // find the region containing the start of this alignment block
        while (offsets[i] > regionColor[regionIdx].end) {
          regionIdx++;
        }
        var color = regionColor[regionIdx].color(depth);
        // does the alignment block extend beyond the end of the region?
        if (offsets[i+1] > regionColor[regionIdx].end+1) {
          bins.push(renderBlock({
            start: offsets[i],
            end: regionColor[regionIdx].end,
            color: color
          }));
          offsets[i] = regionColor[regionIdx].end+1;
          if (!alignment.hist.hasOwnProperty(offsets[i])) {
            alignment.hist[offsets[i]] = 0
          }
          i--;
        }
        else {
          bins.push(renderBlock({
            start: offsets[i],
            end: offsets[i+1],
            color: color
          }));
        }
      }
    }
    var sf = this.props.width / alignment.size;
    var transform = 'scale('+ sf +' 1)';
    return (
      <g className="alignment" transform={transform}>
        {this.renderHighlight()}
        {bins}
      </g>
    );
  }
});

module.exports = Alignment;