var React = require('react');

var taxonomyColor = require('../../utils/taxonomyColor');

var Collapsed = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired
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
    var d = 'M0,0 30,10 30,-10 0,0';

    return (
      <path d={d} style={this.style()}/>
    )
  },

  render: function () {
    return (
      <g className={this.className()}>
        {this.triangle()}
        {this.text()}
      </g>
    )
  }
});

module.exports = Collapsed;