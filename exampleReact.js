var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var _ = require('lodash');

var genetree = require('./genetree.json');
var gene = require('./gene.json');

var m = [20, 120, 20, 120],
  w = 480 - m[1] - m[3],
  h = 800 - m[0] - m[2];

var x0 = h / 2;
var y0 = 0;

function scaleBranchLengths(nodes, w) {
  // Visit all nodes and adjust y pos width distance metric
  var visitPreOrder = function (root, callback) {
    callback(root);
    if (root.children) {
      for (var i = root.children.length - 1; i >= 0; i--) {
        visitPreOrder(root.children[i], callback)
      }
    }
  };
  visitPreOrder(nodes[0], function (node) {
    node.rootDist = (node.parent ? node.parent.rootDist : 0) + Math.max(node.distance_to_parent, 0.02)
  });
  var rootDists = nodes.map(function (n) { return n.rootDist; });
  var yscale = d3.scale.linear()
    .domain([0, d3.max(rootDists)])
    .range([0, w]);
  var xscale = d3.scale.linear()
    .domain([nodes[0].left_index, nodes[0].right_index])
    .range([0, h]);
  visitPreOrder(nodes[0], function (node) {
    node.x = xscale((node.left_index + node.right_index) / 2);
    node.y = yscale(node.rootDist);
  });
  return yscale;
}

function transformNode(d) {
  var x, y;
  if (d.node.x) {
    x = d.node.x;
    y = d.node.y;
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
    nodes = this.tree.nodes(this.props.data);

    scaleBranchLengths(nodes, w);

    //nodes = nodes.reverse();

    nodeComponents = nodes.map(function (node, idx) {
      node.id = 'Node' + idx;
      return <Node key={node.id} node={node} gene={gene}/>;
    });

    edgeComponents = nodes.filter(function (n) { return n.parent })
      .map(function (node, idx) {
        return <Edge key={node.id} source={node} target={node.parent} gene={gene}/>
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

      if(d.node.node_type) {
        switch(d.node.node_type) {
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

      if(d.node.gene_stable_id === d.gene._id) {
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
          d.gene._id === d.node.gene_stable_id ||
          _.includes(_.get(d.gene, 'homology.within_species_paralog'), d.node.gene_stable_id);
        return opaque ? 1 : 0;
      })
      .style("fill", fillColor);


    nodeEnter.select("text")
      .attr("x", function (d) {
        return d.node.children || d.node._children ? -10 : 10;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", function (d) { return d.node.children || d.node._children ? "end" : "start"; })
      .text(function (d) { return d.node.gene_display_label || d.node.gene_stable_id || ''; })
      .style("fill-opacity", function(d) {
        return hovered || d.gene._id === d.node.gene_stable_id ? 1 : 0;
      });
  }
});

var Edge = React.createClass({
  diagonal: (function () {
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
  })(),
  propTypes: {
    source: React.PropTypes.object.isRequired, // child
    target: React.PropTypes.object.isRequired,  // parent
    gene: React.PropTypes.object
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

ReactDOM.render(
  <Tree data={genetree}/>,
  document.getElementById('tree')
);