'use strict';
var colors = require('d3').scale.category10().range();

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
    var bins = domains.list.map(function(domain) {
      var w = domain.end - domain.start + 1;

      var color = colors[domain.root % colors.length];
      var opacity = 0.5/domain.nSeqs;
      var style = {fill: color, stroke: false, fillOpacity: opacity};
      k++;
      return (
        <rect key={k} width={w} height="5" x={domain.start} style={style} />
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