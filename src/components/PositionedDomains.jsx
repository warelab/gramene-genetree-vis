'use strict';

var React = require('react');
var microsoftBrowser = require('../utils/microsoftBrowser');
var Domains = require('./Domains.jsx');

var PositionedDomains = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    stats: React.PropTypes.object.isRequired,
    alignment: React.PropTypes.object.isRequired
  },
  
  getInitialState: function () {
    return {};
  },

  transform: function () {
    var x, y;
    x = 0;
    y = this.props.node.x - 9;

    return 'translate(' + x + ', ' + y + ')';
  },

  render: function () {
    return (
      <g transform={this.transform()}>
        <Domains stats={this.props.stats} width={this.props.width} node={this.props.node} alignment={this.props.alignment} />
      </g>
    )
  }
});

module.exports = PositionedDomains;