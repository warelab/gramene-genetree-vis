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
    var genetree;
    genetree = _.cloneDeep(this.props.genetree);
    genetree.walk(function(n, idx) { n.idx = idx; return n; });
    geneOfInterest = geneOfInterest || this.props.initialGeneOfInterest;
    this.relateNodesToGeneOfInterest(genetree, geneOfInterest);
    this.collapseNodes(genetree, geneOfInterest, 20);
    this.layoutNodes(genetree);
    this.setState({
      genetree: genetree,
      geneOfInterest: geneOfInterest
    });
  },
  handleGeneSelect: function (geneNode) {
    GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
      var geneOfInterest = response.docs[0];
      this.initNodes(geneOfInterest);
    }.bind(this))
  },
  handleInternalNodeSelect: function (node) {
    this.setState({selectedInternalNode: node});
  },
  handleNodeHover: function (node) {
    this.setState({hoveredNode: node});
  },
  render: function () {
    var genetree, selections;

    if (this.state.genetree) {
      genetree = (
        <GeneTree nodes={this.state.genetree.all()}
                  onGeneSelect={this.handleGeneSelect}
                  onInternalNodeSelect={this.handleInternalNodeSelect}
                  onNodeHover={this.handleNodeHover}/>
      );
    }

    selections = [];
    if(this.state.geneOfInterest) {
      selections.push(
        <li key="gene">
          <h4>Gene</h4>
          <p>{this.state.geneOfInterest._id}</p>
        </li>
      );
    }

    if(this.state.selectedInternalNode) {
      selections.push(
        <li key="internal-node">
          <h4>Internal</h4>
          <p>{this.state.selectedInternalNode.model.node_taxon} {this.state.selectedInternalNode.model.node_type}</p>
        </li>
      );
    }

    if(this.state.hoveredNode) {
      var hoverText = this.state.hoveredNode.model.node_taxon ?
        this.state.hoveredNode.model.node_taxon + ' ' + this.state.hoveredNode.model.node_type :
        this.state.hoveredNode.model.gene_stable_id + ' ' + this.state.hoveredNode.model.system_name;
      selections.push(
        <li key="hovered-node">
          <h4>Hovered</h4>
          <p>{hoverText}</p>
        </li>
      );
    }

    return (
      <div className="genetree-vis">
        <div className="selections">
          <ul>
            {selections}
          </ul>
        </div>
        <svg width={this.props.width} height={this.props.height}>
          {genetree}
        </svg>
      </div>
    );
  },

  collapseNodes: function (genetree, geneOfInterest, maxVisibleNodes) {
    var nodesToExpand, paralogIds, paralogNodes, paralogPathIds, repIds, pathIds;

    // get node_ids of representatives and gene of interest.
    repIds = _.values(geneOfInterest.representative).map(function (rep) { return rep.id; });
    nodesToExpand = _.map(repIds, idToNode);
    nodesToExpand.push(idToNode(geneOfInterest._id));

    // get and index all node_ids in the paths for those nodes.
    // these are the ones that should be expanded by default.
    pathIds = _.reduce(nodesToExpand, nodesToPathIds, {});

    paralogIds = _.get(geneOfInterest, 'homology.within_species_paralog');
    paralogNodes = _.map(paralogIds, idToNode);
    paralogPathIds = _.reduce(paralogNodes, nodesToPathIds, {});

    genetree.walk(function (node) {
      var nodeId = node.model.node_id;
      node.displayInfo = {
        expanded: !!pathIds[nodeId],
        expandedBecause: pathIds[nodeId],
        paralogs: paralogPathIds[nodeId]
      };
    });

    function idToNode(id) { return genetree.indices.gene_stable_id[id]; }

    function nodesToPathIds(acc, node) {
      // key: pathNodeId
      // value: array of actual nodes (not the ones in the path).

      var paralogPairs, paralogLUT;
      paralogPairs = _.map(node.getPath(), function (n) {
        return [n.model.node_id, node];
      });
      paralogLUT = _.fromPairs(paralogPairs);

      return _.assignWith(acc, paralogLUT, function (accVal, srcVal) {
        return _.isUndefined(accVal) ? [srcVal] : _.concat(accVal, srcVal);
      });
    }
  },

  // https://gist.github.com/kueda/1036776#file-d3-phylogram-js-L175
  layoutNodes: function layoutNodes(genetree) {
    var w, h, visitPreOrder, rootDists, xscale, yscale;

    w = this.props.width / 2;
    h = this.props.height;

    // Visit all nodes and adjust y pos width distance metric
    //visitPreOrder = function (root, callback) {
    //  callback(root);
    //  if (root.children) {
    //    for (var i = root.children.length - 1; i >= 0; i--) {
    //      visitPreOrder(root.children[i], callback)
    //    }
    //  }
    //};
    //visitPreOrder(nodes[0], function (node) {
    //  node.root_dist = (node.parent ? node.parent.root_dist : 0) + (Math.max(node.model.distance_to_parent, 0.02) || 0);
    //});
    genetree.walk(function (node) {
      node.root_dist = (node.parent ? node.parent.root_dist : 0) + (Math.max(node.model.distance_to_parent, 0.02) || 0);
    });
    rootDists = genetree.all().map(function (n) { return n.root_dist; });
    yscale = scale()
      .domain([0, _.max(rootDists)])
      .range([0, w]);

    xscale = scale()
      .domain([genetree.model.left_index, genetree.model.right_index])
      .range([0, h]);

    genetree.walk(function (node) {
      node.x = xscale((node.model.left_index + node.model.right_index) / 2);
      node.y = yscale(node.root_dist);
    });
  },
  relateNodesToGeneOfInterest: function (genetree, geneOfInterest) {
    genetree.walk(function (node) {
      node.relationToGeneOfInterest = {};
    });
    this.addHomologyInformationToNodes(genetree, geneOfInterest);
    this.addTaxonDistanceInformationToNodes(genetree, geneOfInterest);
  },
  addHomologyInformationToNodes: function (genetree, theGene) {
    var homologs, representatives;
    if (theGene) {
      homologs = indexHomologs(theGene);
      representatives = indexReps(theGene);
      genetree.walk(function (node) {
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
  addTaxonDistanceInformationToNodes: function (genetree, geneOfInterest) {
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

      genetree.walk(function (node) {
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
