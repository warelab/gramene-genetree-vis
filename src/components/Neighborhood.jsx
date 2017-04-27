'use strict';

var React = require('react');


var Neighborhood = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    neighborhood: React.PropTypes.object.isRequired
  },
    
  render: function () {
    var node = this.props.node;
    var neighborhood = this.props.neighborhood;

    return (
      <g className="Neighborhood" >
        <rect width="10" height="18" />
      </g>
    );
  }
});

module.exports = Neighborhood;