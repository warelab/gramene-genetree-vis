'use strict';

var React = require('react');

var positionExonJunctions = require('../utils/positionExonJunctions');

var ExonJunctions = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired
  },
  
  getInitialState: function () {
    return {
      exonJunctions : positionExonJunctions(this.props.node)
    };
  },
  
  render: function () {
    var node = this.props.node;
    var exonJunctions = this.state.exonJunctions;

    var k=0;
    var sf = this.props.width / exonJunctions.size;
    var bins = exonJunctions.list.map(function(ej) {
      var top = ej * sf;
      var bl = top-2.0;
      var br = top+2.0;
      var d = 'M'+top+',0 '+bl+',+3 '+br+',+3 '+top+',0';
      var style = {fill: "darkred"};
      k++;
      return (
        <path d={d} style={style} key={k}/>
      )
    });
    return (
      <g className="exonJunctions" >
        {bins}
      </g>
    );
  }
});

module.exports = ExonJunctions;