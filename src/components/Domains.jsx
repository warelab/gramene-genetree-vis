'use strict';
var scale = require('d3').scale.linear;

var React = require('react');

var positionDomains = require('../utils/positionDomains');

var Domains = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired
  },
  
  getInitialState: function () {
    return {
      domains : positionDomains(this.props.node)
    };
  },

  render: function () {
    var node = this.props.node;
    var domains = this.state.domains;

    var k=0;
    var bins = domains.hist.map(function(bin) {
      var w = bin.end - bin.start+1;

      var color = 'orange';
      var style = {fill: color, stroke: color, fillOpacity: 0.5, strokeOpacity: 0.5};
      k++;
      return (
        <rect key={k} width={w} height="18" x={bin.start} style={style} />
      )
    });
    var sf = this.props.width / domains.size;
    var transform = 'scale('+ sf +' 1)';
    return (
      <g className="domains" transform={transform}>
        {bins}
      </g>
    );
  }
});

module.exports = Domains;