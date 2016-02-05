var React = require('react');
var _ = require('lodash');

var Node = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      hovered: false
    }
  },

  handleClick: function () {
    console.log('clicked', this.props);
    this.props.onSelect(this.props.node);
  },

  hover: function () {
    console.log('hover', this.props);
    this.props.onHover(this.props.node);
    this.setState({hovered: true});
  },

  unhover: function () {
    console.log('unhover', this.props);
    this.setState({hovered: false});
  },

  className: function () {
    var className, homology, repType;

    className = 'node';
    homology = _.get(this.props.node, 'relationToGeneOfInterest.homology');
    repType = _.get(this.props.node, 'relationToGeneOfInterest.repType');
    if (this.state.hovered) {
      className += ' hover';
    }
    if (homology) {
      className += ' homolog ' + homology;
    }
    if (repType) {
      className += ' representative';
    }
    return className;
  },

  transform: function () {
    return 'translate(' + this.props.node.y + ', ' + this.props.node.x + ')';
  },

  text: function () {
    return (
      _.get(this.props.node, 'model.gene_display_label') ||
      _.get(this.props.node, 'model.gene_stable_id') ||
      ''
    );
  },

  render: function () {
    return (
      <g className={this.className()}
         transform={this.transform()}
         onClick={this.handleClick}
         onMouseOver={this.hover}
         onMouseOut={this.unhover}>
        <circle r="3"/>
        <text x="10"
              dy=".35em"
              textAnchor="start">
          {this.text()}
        </text>
      </g>
    )
  }
});

module.exports = Node;