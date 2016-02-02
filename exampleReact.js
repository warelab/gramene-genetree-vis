var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');

var genetree = require('./genetree.json');

var m = [20, 120, 20, 120],
  w = 1280 - m[1] - m[3],
  h = 800 - m[0] - m[2];

var x0 = h / 2;
var y0 = 0;

function transformNode(d) {
  var x, y;
  if (d.x) {
    x = d.x;
    y = d.y;
  }
  else {
    x = x0;
    y = y0;
  }
  return "translate(" + y + "," + x + ")";
}

var Tree = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  componentWillMount: function () {
    this.tree = d3.layout.tree()
      .size([h, w]);
  },
  render: function () {
    var nodes, nodeComponents, edgeComponents;
    // Compute the new tree layout.
    nodes = this.tree.nodes(this.props.data).reverse();

    nodeComponents = nodes.map(function (node, idx) {
        node.id = idx;
        return <Node key={node.id} node={node}/>;
      });

    edgeComponents = nodes.filter(function (n) { return n.parent })
      .map(function (node) {
        return <Edge key={node.id} source={node} target={node.parent}/>
      });

    return (
      <svg width={w + m[1] + m[3]}
           height={h + m[0] + m[2]}>
        <g transform={'translate(' + m[3] + ',' + m[0] + ')'}>
          {nodeComponents}
          {edgeComponents}
        </g>
      </svg>
    );
  }
});

var Node = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired
  },
  componentWillMount: function () {
    var n = this.props.node;

    // Normalize for fixed-depth.
    //n.y = n.depth * 180;
  },
  componentDidMount: function () {
    this.d3El = d3.select(ReactDOM.findDOMNode(this));
    this.d3El
      .datum(this.props.node)
      .call(this.update);
  },
  componentDidUpdate: function () {
    this.d3El
      .datum(this.props.node)
      .call(this.update);
  },
  render: function () {
    return (
      <g className="node" id={this.props.node.id} onClick={this.handleClick}>
        <circle />
        <text />
      </g>
    )
  },

  update: function (selection) {
    // Enter any new nodes at the parent's previous position.
    var nodeEnter = selection
      .attr("class", "node")
      .attr("transform", transformNode)
      .on("click", function (d) {
        console.log('clicked', d);
        //toggle(d); update(d);
      });

    nodeEnter.select("circle")
      .attr("r", 4.5)
      .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.select("text")
      .attr("x", function (d) {
        return d.children || d._children ? -10 : 10;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
      .text(function (d) { return d.node_type || d.gene_stable_id; })
      .style("fill-opacity", 1);
  }
});

var Edge = React.createClass({
  diagonal: function (d) {
    var y = (!d.target.children || d.target.children.length == 0)
      ? 0
      : d.target.y;

    return "M" + d.source.y + ',' + d.source.x +
      'L' + d.source.y + ',' + d.target.x +
      'L' + y + ',' + d.target.x
      ;
  },
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
    selection.attr("d", this.diagonal);
  },

  render: function () {
    return (
      <path className="link" />
    )
  }
});

ReactDOM.render(
  <Tree data={genetree}/>,
  document.getElementById('tree')
);