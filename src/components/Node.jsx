var React = require('react');
var _ = require('lodash');

var Node = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      hovered: false
    }
  },

  handleClick: function() {
    console.log('clicked', this.props);
    this.props.onSelect(this.props.node);
  },

  hover: function () {
    console.log('hover', this.props);
    this.setState({hovered: true});
  },

  unhover: function () {
    console.log('unhover', this.props);
    this.setState({hovered: false});
  },

  render: function () {
    var node, className, homology, transform, text;
    node = this.props.node;
    className = 'node';
    transform = 'translate(' + node.y + ', ' + node.x + ')';
    text = node.model.gene_display_label || 
      node.model.gene_stable_id || '';
    homology = _.get(node, 'relationToGeneOfInterest.homology');
    if(this.state.hovered) {
      className += ' hover';
    }
    if(homology) {
      className += ' homolog ' + homology;
    }

    return (
      <g className={className}
         id={node.id}
         onClick={this.handleClick}
         onMouseOver={this.hover}
         onMouseOut={this.unhover}
         transform={transform}>
        <circle r="3"/>
        <text x="10" 
              dy=".35em" 
              textAnchor="start">
          {text}
        </text>
      </g>
    )
  }
});

module.exports = Node;