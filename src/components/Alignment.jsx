'use strict';

var React = require('react');

var calculateAlignment = require('../utils/calculateAlignment');

var Alignment = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired
  },
  
  getInitialState: function () {
    return {};
  },

  componentWillMount: function () {
    var node = this.props.node;
    calculateAlignment(node);
  },

  render: function () {
    var alignment = this.props.node.alignment;
    var bins = alignment.hist.map(function(bin) {
      var w = bin.end - bin.start+1;
      return (
        <rect width={w} height="12" x={bin.start} />
      )
    });
    var sf = this.props.width / alignment.size;
    var transform = 'scale('+ sf +' 1)';
    return (
      <g className="alignment" transform={transform}>
        {bins}
      </g>
    );
  }
});

module.exports = Alignment;