var React = require('react');

var Edge = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired, // child
    target: React.PropTypes.object.isRequired  // parent
  },

  hover: function () {
    console.log('hover', this.props);
  },

  unhover: function () {
    console.log('unhover', this.props);
  },

  path: function() {
    var source, target, coords;
    source = this.props.source;
    target = this.props.target;
    coords = [
      [source.y, source.x],
      [target.y, source.x],
      [target.y, target.x]
    ];

    return 'M' + coords.join(' ');
  },

  render: function () {
    var path = this.path();
    return (
      <path className="link"
            d={path}
            onMouseOver={this.hover}
            onMouseOut={this.unhover}/>
    )
  }
});

module.exports = Edge;