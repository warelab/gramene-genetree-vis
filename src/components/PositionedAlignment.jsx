'use strict';

var React = require('react');
var microsoftBrowser = require('../utils/microsoftBrowser');
var Alignment = require('./Alignment.jsx');

var PositionedAlignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired
  },
  
  getInitialState: function () {
    return {};
  },

  transform: function (isStyle) {
    var x, y, px;

    px = isStyle ? 'px' : '';

    x = this.props.node.x - 6;
    y =0;

    return 'translate(' + y + px + ', ' + x + px + ')';
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
        <Alignment node={this.props.node} />
      </g>
    )
  }
});

module.exports = PositionedAlignment;