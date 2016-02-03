var React = require('react');
var scale = require('d3').scale.linear;
var _ = require('lodash');

var GeneTree = require('./GeneTree.jsx');

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    genetree: React.PropTypes.object.isRequired,
    geneOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object
  },
  getInitialState: function () {
    return {};
  },
  componentWillMount: function () {
    var initNodesDeferred = function initNodesDeferred() {
      var nodes = _.cloneDeep(this.props.genetree.all());
      this.layoutNodes(nodes);
      this.relateNodesToGeneOfInterest(nodes);
      this.setState({nodes: nodes});
    }.bind(this);
    process.nextTick(initNodesDeferred);
  },
  render: function () {
    var genetree;

    if (this.state.nodes) {
      genetree = (
        <GeneTree nodes={this.state.nodes}/>
      );
    }

    return (
      <svg width={this.props.width} height={this.props.height}>
        {genetree}
      </svg>
    );
  },

  // https://gist.github.com/kueda/1036776#file-d3-phylogram-js-L175
  layoutNodes: function layoutNodes(nodes) {
    var w, h, visitPreOrder, rootDists, xscale, yscale;

    w = this.props.width / 2;
    h = this.props.height;

    // Visit all nodes and adjust y pos width distance metric
    visitPreOrder = function (root, callback) {
      callback(root);
      if (root.children) {
        for (var i = root.children.length - 1; i >= 0; i--) {
          visitPreOrder(root.children[i], callback)
        }
      }
    };
    visitPreOrder(nodes[0], function (node) {
      node.root_dist = (node.parent ? node.parent.root_dist : 0) + (Math.max(node.model.distance_to_parent, 0.02) || 0);
    });
    rootDists = nodes.map(function (n) { return n.root_dist; });
    yscale = scale()
      .domain([0, _.max(rootDists)])
      .range([0, w]);
    xscale = scale()
      .domain([nodes[0].model.left_index, nodes[0].model.right_index])
      .range([0, h]);
    visitPreOrder(nodes[0], function (node) {
      node.x = xscale((node.model.left_index + node.model.right_index) / 2);
      node.y = yscale(node.root_dist);
    });
    return yscale;
  },
  relateNodesToGeneOfInterest: function (nodes) {
    _.forEach(nodes, function (node) {
      node.relationToGeneOfInterest = {};
    });
    this.addHomologyInformationToNodes(nodes);
    this.addTaxonDistanceInformationToNodes(nodes);
  },
  addHomologyInformationToNodes: function (nodes) {
    var theGene = this.props.geneOfInterest;
    if (theGene) {
      var homologs = indexHomologs(theGene);
      _.forEach(nodes, function (node) {
        var nodeId, homology;
        nodeId = node.model.gene_stable_id;
        if (nodeId) {
          if (nodeId === theGene._id) {
            homology = 'self';
          }
          else {
            homology = homologs[nodeId];
          }
          node.relationToGeneOfInterest.homology = homology;
        }
      });
    }
  },
  addTaxonDistanceInformationToNodes: function (nodes) {
    var theGeneTaxonId, theTaxonNode, theTaxonPath,
      theTaxonPathIds, taxonomy, relationLUT, distances, maxima;

    theGeneTaxonId = _.get(this.props, 'geneOfInterest.taxon_id');
    taxonomy = this.props.taxonomy;

    if (theGeneTaxonId && taxonomy) {
      theTaxonNode = taxonomy.indices.id[theGeneTaxonId];
      theTaxonPath = theTaxonNode.getPath();
      theTaxonPathIds = _.keyBy(theTaxonPath, 'model.id');
      relationLUT = {};
      maxima = {
        lcaDistance: 0,
        pathDistance: 0
      };

      _.forEach(nodes, function (node) {
        var nodeTaxonId, nodeTaxon, pathDistance, lcaDistance, lca;
        nodeTaxonId = node.model.taxon_id || node.model.node_taxon_id;

        // have we already seen this?
        if (relationLUT[nodeTaxonId]) {
          node.relationToGeneOfInterest.taxonomy = relationLUT[nodeTaxonId];
        }
        else {
          if (nodeTaxonId === theGeneTaxonId) {
            lcaDistance = 0;
            pathDistance = 0;
          }
          else {
            if ((lca = theTaxonPathIds[nodeTaxonId])) {
              pathDistance = 0;
            }
            else {
              nodeTaxon = taxonomy.indices.id[nodeTaxonId];
              lca = theTaxonNode.lcaWith([nodeTaxon]);
              pathDistance = lca.pathTo(nodeTaxon).length - 1;
            }

            lcaDistance = theTaxonPath.length - _.indexOf(theTaxonPath, lca) - 1;
          }

          distances = {
            lcaDistance: lcaDistance,
            pathDistance: pathDistance,
            maxima: maxima
          };
          
          maxima.lcaDistance = Math.max(maxima.lcaDistance, distances.lcaDistance);
          maxima.pathDistance = Math.max(maxima.pathDistance, distances.pathDistance);
          
          relationLUT[nodeTaxonId] = node.relationToGeneOfInterest.taxonomy = distances;
        }
      });

      
    }
  }
});

// IN -> key: homologyType, value: [geneId]
// OUT-> key: geneId, value: homologyType
function indexHomologs(theGene) {
  return _.transform(theGene.homology, function (result, value, key) {
    _.forEach(value, function (id) {
      result[id] = key;
    });
    return result;
  }, {});
}

module.exports = TreeVis;
