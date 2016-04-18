'use strict';

var React = require('react');
var microsoftBrowser = require('../utils/microsoftBrowser');
var Alignment = require('./Alignment.jsx');

var PositionedAlignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired
  },
  
  getInitialState: function () {
    return {};
  },

  transform: function (isStyle) {
    var x, y, px;

    px = isStyle ? 'px' : '';

    x = 0;
    y = this.props.node.x - 4;

    return 'translate(' + x + px + ', ' + y + px + ')';
  },

  render: function () {
    var props = {};
    if(microsoftBrowser) {
      props.transform = this.transform(false);
    }
    else {
      props.style = { transform: this.transform(true) };
    }

    return (
      <g {...props}>
        <Alignment width={this.props.width} node={this.props.node} />
      </g>
    )
  }
});

module.exports = PositionedAlignment;