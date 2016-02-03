var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var _ = require('lodash');

var Node = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    gene: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      hovered: false
    }
  },
  componentWillMount: function () {
    var n = this.props.node;

    // Normalize for fixed-depth.
    //n.y = n.depth * 180;
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


  hover: function () {
    console.log('hover', this.props);
    this.setState({hovered: true});
  },

  unhover: function () {
    console.log('unhover', this.props);
    this.setState({hovered: false});
  },
  render: function () {
    return (
      <g className="node"
         id={this.props.node.id}
         onClick={this.handleClick}
         onMouseOver={this.hover}
         onMouseOut={this.unhover}
      >
        <circle />
        <text />
      </g>
    )
  },

  update: function (selection) {
    var hovered, fillColor, nodeEnter;
    hovered = this.state.hovered;

    fillColor = function(d) {
      var result = '#fff';

      if(d.node.model.node_type) {
        switch(d.node.model.node_type) {
          case 'speciation':
            result = 'red';
            break;
          case "duplication":
            result = 'blue';
            break;
          default:
            result = 'grey';
        }
      }

      if(d.node.model.gene_stable_id === d.gene._id) {
        result = 'red';
      }

      return result;
    };

    // Enter any new nodes at the parent's previous position.
    nodeEnter = selection
      .attr("class", "node")
      .attr("transform", transformNode)
      .on("click", function (d) {
        console.log('clicked', d);
        //toggle(d); update(d);
      });

    nodeEnter.select("circle")
      .attr("r", 3)
      .style("opacity", function(d) {
        var opaque = hovered ||
          d.gene._id === d.node.model.gene_stable_id ||
          _.includes(_.get(d.gene, 'homology.within_species_paralog'), d.node.model.gene_stable_id);
        return opaque ? 1 : 0;
      })
      .style("fill", fillColor);


    nodeEnter.select("text")
      .attr("x", function (d) {
        return d.node.children || d.node._children ? -10 : 10;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", function (d) { return d.node.children || d.node._children ? "end" : "start"; })
      .text(function (d) { return d.node.model.gene_display_label || d.node.model.gene_stable_id || ''; })
      .style("fill-opacity", function(d) {
        return hovered || d.gene._id === d.node.model.gene_stable_id ? 1 : 0;
      });
  }
});

module.exports = Node;


function transformNode(d) {
  var x, y;
  if (d.node.x) {
    x = d.node.x;
    y = d.node.y;
    return "translate(" + y + "," + x + ")";
  }
}