'use strict';

var React = require('react');

var taxonomyColor = require('../../utils/taxonomyColor');

var Collapsed = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {};
  },

  select: function() {

  },

  hover: function() {

  },

  unhover: function() {

  },

  className: function () {
    var className;

    className = 'collapsed';

    return className;
  },

  text: function () {
    return <text x="36"
                 dy=".35em">Hello</text>;
  },

  style: function () {
    var color = taxonomyColor(this.props.node);
    return {fill: color, stroke: color};
  },

  triangle: function () {
    var d = 'M0,0 30,8 30,-8 0,0';

    return (
      <path d={d} style={this.style()}/>
    )
  },

  render: function () {
    return (
      <g className={this.className()}
        onMouseOver={this.hover}
        onMouseOut={this.unhover}
        onClick={this.select} >
        {this.triangle()}
        {this.text()}
      </g>
    )
  }
});

module.exports = Collapsed;