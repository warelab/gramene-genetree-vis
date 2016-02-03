var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var _ = require('lodash');

var Edge = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired, // child
    target: React.PropTypes.object.isRequired  // parent
  },
  componentDidMount: function () {
    this.d3El = d3.select(ReactDOM.findDOMNode(this));
    this.d3El
      .datum(this.props)
      .call(this.update);
  },
  componentDidUpdate: function () {
    this.d3El
      .datum(this.props)
      .call(this.update);
  },

  update: function (selection) {
    selection.attr("d", diagonal);
  },

  hover: function () {
    console.log('hover', this.props);
  },

  unhover: function () {
    console.log('unhover', this.props);
  },

  render: function () {
    return (
      <path className="link" onMouseOver={this.hover} onMouseOut={this.unhover}/>
    )
  }
});

module.exports = Edge;

// https://gist.github.com/kueda/1036776#file-d3-phylogram-js-L77
var diagonal = (function diagonal() {
  var projection = function (d) { return [d.y, d.x]; }

  var path = function (pathData) {
    return "M" + pathData[0] + ' ' + pathData[1] + " " + pathData[2];
  };

  function diagonal(diagonalPath, i) {
    var source = diagonalPath.source,
      target = diagonalPath.target,
      pathData = [source, {x: source.x, y: target.y}, target];
    pathData = pathData.map(projection);
    return path(pathData)
  }

  diagonal.projection = function (x) {
    if (!arguments.length) return projection;
    projection = x;
    return diagonal;
  };

  diagonal.path = function (x) {
    if (!arguments.length) return path;
    path = x;
    return diagonal;
  };

  return diagonal;
})();