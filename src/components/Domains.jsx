'use strict';
var colors = require('d3').scale.category10().range();

var React = require('react');

var positionDomains = require('../utils/positionDomains');

var Domains = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    highlight: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      domains: positionDomains(this.props.node)
    };
  },

  render: function () {
    var sf = this.props.width / this.state.domains.size;
    var transform = 'scale(' + sf + ' 1)';
    return (
      <g className="domains" transform={transform}>
        {this.renderHighlight()}
        {this.renderDomains()}
      </g>
    );
  },

  renderHighlight: function () {
    if (this.props.highlight) {
      var hlStyle = {fill: this.props.highlight, stroke: false};
      return (
        <rect key='highlight'
              width={this.state.domains.size}
              height="18"
              style={hlStyle}/>
      );
    }
  },

  renderDomains: function () {
    return this.state.domains.list.map(function (domain, idx) {
      var w = domain.end - domain.start + 1;

      var color = colors[domain.root % colors.length];
      var opacity = 0.5 / domain.nSeqs;
      var style = {fill: color, stroke: false, fillOpacity: opacity};
      return (
        <rect key={idx}
              width={w}
              height="5"
              x={domain.start}
              style={style}
              onMouseOver={()=>console.log("rect", domain)}/>
      )
    });
  }
});

module.exports = Domains;