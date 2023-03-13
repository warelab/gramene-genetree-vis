import React, {Component} from 'react';
var d3Scale = require('d3-scale');
var _ = require('lodash');

var alignmentTools = require('../utils/calculateAlignment');

class Alignment extends Component {
  // props: {
  //   id: React.PropTypes.number.isRequired,
  //   node: React.PropTypes.object.isRequired,
  //   width: React.PropTypes.number.isRequired,
  //   stats: React.PropTypes.object.isRequired,
  //   domains: React.PropTypes.object.idRequired,
  //   highlight: React.PropTypes.string.isRequired,
  //   alignment: React.PropTypes.object.isRequred
  // }

  getColorMap(alignment, stats) {
    var regionColor = [];
    var grayScale = d3Scale.scaleLinear().domain([0, alignment.nSeqs]).range(['#DDDDDD','#444444']);
    var prevEnd=0;
    if (this.props.domains.length > 0) {
      alignmentTools.resolveOverlaps(this.props.domains).forEach(function(d) {
        if (d.start > prevEnd) {
          regionColor.push({
            start: prevEnd,
            end: d.start,
            color: grayScale
          });
        }
        if (d.start < prevEnd) {
          // TODO: deal with overlapping domains
        }
        if (d.end > prevEnd) {
          prevEnd = d.end;
          var maxColor = stats[d.id].color;
          var colorScale = d3Scale.scaleLinear().domain([0, 1]).range(['#FFFFFF', maxColor]);
          regionColor.push({
            start: d.start,
            end: d.end,
            color: d3Scale.scaleLinear().domain([0, alignment.nSeqs]).range([colorScale(0.5), maxColor])
          });
        }
      })
    }
    if (prevEnd < alignment.size) {
      regionColor.push({
        start: prevEnd,
        end: alignment.size,
        color: grayScale
      })
    }
    return regionColor;
  }

  renderHighlight() {
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
  }

  render() {
    var alignment = _.cloneDeep(this.props.alignment);
    var regionColor = this.getColorMap(alignment, this.props.stats);

    var k=0;
    var bins = [];
    var offsets = alignmentTools.getOffsets(alignment.hist);
    var depth=0;
    var regionIdx=0;

    var renderBlock = function (block) {
      var style = {fill: block.color, stroke: false};
      var s = block.start;
      var w = block.end - block.start;
      k++;
      var rect = (
        <rect key={k} width={w} height="14" x={s} style={style} />
      );
      return rect;
    };

    for(var i=0; i<offsets.length - 1; i++) {
      depth += alignment.hist[offsets[i]];
      if (depth > 0) {
        // find the region containing the start of this alignment block
        while (offsets[i] >= regionColor[regionIdx].end) {
          regionIdx++;
        }
        var color = regionColor[regionIdx].color(depth);
        // does the alignment block extend beyond the end of the region?
        if (offsets[i+1] > regionColor[regionIdx].end) {
          bins.push(renderBlock({
            start: offsets[i],
            end: regionColor[regionIdx].end,
            color: color
          }));
          offsets[i] = regionColor[regionIdx].end;
          if (!alignment.hist.hasOwnProperty(offsets[i])) {
            alignment.hist[offsets[i]] = 0;
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
    return (
      <g className="alignment">
        {this.renderHighlight()}
        {bins}
      </g>
    );
  }
};

export default Alignment;
