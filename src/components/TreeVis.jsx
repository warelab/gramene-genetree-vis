var React = require('react');
var scale = require('d3').scale.linear;
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;

var GeneTree = require('./GeneTree.jsx');

var TreeVis = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object
  },
  getInitialState: function () {
    return {};
  },
  componentWillMount: function () {
    this.initNodesDeferred();
  },
  initNodesDeferred: function () {
    process.nextTick(this.initNodes);
  },
  initNodes: function (geneOfInterest) {
    var genetree, nodes;
    genetree = _.cloneDeep(this.props.genetree);
    nodes = genetree.all();
    geneOfInterest = geneOfInterest || this.props.initialGeneOfInterest;
    this.relateNodesToGeneOfInterest(nodes, geneOfInterest);
    this.collapseNodes(genetree, this.props.initialGeneOfInterest, 20);
    this.layoutNodes(nodes);
    this.setState({
      genetree: genetree,
      geneOfInterest: geneOfInterest
    });
  },
  handleGeneSelect: function (id) {
    GrameneClient.genes(id).then(function (response) {
      var geneOfInterest = response.docs[0];
      this.initNodes(geneOfInterest);
    }.bind(this))
  },
  componentWillUpdate: function (newProps, newState) {

  },
  render: function () {
    var genetree;

    if (this.state.genetree) {
      genetree = (
        <GeneTree nodes={this.state.genetree.all()} onGeneSelect={this.handleGeneSelect}/>
      );
    }

    return (
      <svg width={this.props.width} height={this.props.height}>
        {genetree}
      </svg>
    );
  },

  collapseNodes: function() {

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
  relateNodesToGeneOfInterest: function (nodes, geneOfInterest) {
    _.forEach(nodes, function (node) {
      node.relationToGeneOfInterest = {};
    });
    this.addHomologyInformationToNodes(nodes, geneOfInterest);
    this.addTaxonDistanceInformationToNodes(nodes, geneOfInterest);
  },
  addHomologyInformationToNodes: function (nodes, theGene) {
    var homologs, representatives;
    if (theGene) {
      homologs = indexHomologs(theGene);
      representatives = indexReps(theGene);
      _.forEach(nodes, function (node) {
        var nodeId, homology, repType;
        nodeId = node.model.gene_stable_id;
        if (nodeId) {
          if (nodeId === theGene._id) {
            homology = 'self';
          }
          else {
            homology = homologs[nodeId];
          }

          node.relationToGeneOfInterest.homology = homology;
          node.relationToGeneOfInterest.repType = representatives[nodeId];
        }
      });
    }
  },
  addTaxonDistanceInformationToNodes: function (nodes, geneOfInterest) {
    var theGeneTaxonId, theTaxonNode, theTaxonPath,
      theTaxonPathIds, taxonomy, relationLUT, distances, maxima;

    theGeneTaxonId = geneOfInterest.taxon_id;
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

// IN -> key: representativeType, value: gene doc
// OUT-> key: geneId, value: representativeType
function indexReps(theGene) {
  return _.transform(theGene.representative, function (result, rep, repType) {
    result[rep.id] = repType;
    return result;
  }, {});
}

module.exports = TreeVis;
