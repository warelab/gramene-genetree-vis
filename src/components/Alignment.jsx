'use strict';

var React = require('react');

var Alignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired
  },
  
  getInitialState: function () {
    return {};
  },


  render: function () {
    return (
      <rect width="100%" height="12" />
    )
  }
});

module.exports = Alignment;