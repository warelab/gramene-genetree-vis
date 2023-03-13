import React, { Component } from 'react';
import './App.css';
import './styles/msa.css';
import './styles/tree.css';
import './styles/spinner.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TreeVis from './components/TreeVis.js';
import Feedback from './Feedback';
import {client as searchInterface} from "gramene-search-client";
import queryString from 'query-string';
import Accordion from 'react-bootstrap/Accordion';
// import Q from "q";
import _ from "lodash";
// import GrameneTreesClient from "gramene-trees-client";
let GrameneTrees = require('gramene-trees-client');
let pruneTree = GrameneTrees.extensions.pruneTree;

function details(collection, idList) {
  if (!_.isArray(idList)) {
    idList = [idList];
  }
  return searchInterface.grameneClient.then((client) =>
    client['Data access'][collection]({idList:idList,rows:-1}).then((response) => response.obj)
  );
}

function getTaxonomyLUT() {
  return searchInterface.grameneClient.then((client) =>
      client['Data access']['maps']({rows:-1}).then((response) => response.obj).then((maps) => {
        let taxLut = {};
        maps.forEach(map => {
          taxLut[map.taxon_id] = map.display_name;
        });
        return taxLut;
      })
  );
}

const defaults = {
  gene: "Zm00001eb081610",
  genetree: "MAIZE3GT_424228"
};

class App extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      curatableGenomes: {
        'all':'yep'
      },
      submission: []
    }
  }
  componentDidMount() {
    this.myRef.current.addEventListener('wheel', function(event) {
      if (event.deltaX !== 0) {
        event.preventDefault();
      }
    });
    const parsed = queryString.parse(window.location.search);
    if (!parsed.gene) {
      parsed.gene = defaults.gene;
    }
    let set = parsed.set || 'maize_v3';
    let taxonomyPromise = GrameneTrees.promise.get();
    let orthologsSince=undefined;
    if (parsed.since) {
      orthologsSince = {};
      orthologsSince[parsed.since] = 'keep';
    }
    taxonomyPromise.then(function (taxonomy) {
      let genomesOfInterest = {
        3702:1,
        15368:1,
        3055:1,
        3847:1,
        39947:1,
        88036:1,
        4558:1,
        29760:1,
        4577:1,
        4577001:1,
        4577002:1,
        4577003:1,
        4577004:1,
        4577005:1,
        4577006:1,
        4577007:1,
        4577008:1,
        4577009:1,
        4577010:1,
        4577011:1,
        4577012:1,
        4577013:1,
        4577014:1,
        4577015:1,
        4577016:1,
        4577017:1,
        4577018:1,
        4577019:1,
        4577020:1,
        4577021:1,
        4577022:1,
        4577023:1,
        4577024:1,
        4577025:1
      };
      genomesOfInterest = {};
      let genePromise = details('genes', parsed.gene);
      genePromise.then(function (genes) {
        let geneOfInterest = genes[0];
        let treeId = geneOfInterest.homology.gene_tree.id;
        let treePromise = details('genetrees', treeId);
        treePromise.then(function (tree) {
          let mapsPromise = getTaxonomyLUT();
          mapsPromise.then(function (maps) {
            function update_taxon_name(node) {
              if (maps.hasOwnProperty(node.taxon_id)) {
                node.taxon_name = maps[node.taxon_id]
              }
              else if (node.taxon_id === 1100004558) {
                node.taxon_name = "Sorghum bicolor"
              }
              if (node.taxon_id === 297600009 && node.hasOwnProperty('children')) {
                node.taxon_name = "Vitis vinifera"
              }
              if (node.hasOwnProperty('children')) {
                node.children.forEach(c => update_taxon_name(c))
              }
            }
            update_taxon_name(tree[0]);
            let genetree = GrameneTrees.genetree.tree(tree);
            if (!_.isEmpty(orthologsSince)) {
              let nodeOfInterest = genetree.indices.gene_stable_id[geneOfInterest._id];
              let pathToRoot = nodeOfInterest.getPath().reverse();
              let nodeOnPath = pathToRoot.shift();
              while (!orthologsSince.hasOwnProperty(nodeOnPath.model.taxon_id) && pathToRoot.length > 0) {
                nodeOnPath = pathToRoot.shift();
              }
              if (pathToRoot.length > 0) {
                nodeOnPath.walk(function (descendant) {
                  descendant.model.keep = true;
                });
                genetree = pruneTree(genetree, function (node) {
                  return (node.model.keep);
                });
//              genetree.geneCount = this.props.genetree.geneCount;
              }
            }
            let submission = genetree.leafNodes()
                .filter(node => this.state.curatableGenomes.hasOwnProperty('all') || this.state.curatableGenomes.hasOwnProperty(node.model.taxon_id))
                .map(node => {
                  return {geneId: node.model.gene_stable_id, opinion: 'curate'}
                });
            this.setState({genetree, geneOfInterest, submission, taxonomy, genomesOfInterest, set, orthologsSince});
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
  getCuration(opinion,reason,group) {
    let submission = [];
    for (const gene in opinion) {
      let info = {geneId: gene, opinion: opinion[gene]};
      if (opinion[gene] === 'flag') {
        info.reason = reason[gene];
      }
      if (opinion[gene] === 'unclear') {
        info.reason = group[gene]
      }
      submission.push(info);
    }
    this.setState({submission})
  }

  render() {
    let treeVis;
    let form;
    let geneInfo = <p>Loading</p>;
    if (this.state.genetree) {
      const goi = this.state.geneOfInterest;
      let d = goi.description ? goi.description.replace(/^\s+/,'') : '';
      const name = (goi.name !== goi._id) ? (<span>Gene name: <b>{goi.name}</b>.</span>) : '';
      const descr = (goi.name !== d) ? (<span>Description: <b>{d}</b>.</span>) : '';
      geneInfo = (<div style={{border: '4px solid black', padding:20, margin: 20}}>
        <p>This is the gene tree containing <b>{goi._id}</b>. {name} {descr}</p>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Curation Instructions</Accordion.Header>
            <Accordion.Body>
              <p>Mark genes as okay or flag genes that you think might have issues and choose a reason from the drop down menu. When finished, enter your email address and submit.</p>
              <p>The reason for flagging a gene model is optional, but you may indicate whether there is a gain (G), loss (L) or no change (_) in the beginning, middle, and end of the gene model.</p>
              <p>For example <code>L,_,_</code> means there is a loss at the 5' end.</p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>);
      treeVis = <TreeVis genetree={this.state.genetree}
                         initialGeneOfInterest={this.state.geneOfInterest}
                         taxonomy={this.state.taxonomy}
                         genomesOfInterest={this.state.genomesOfInterest}
                         orthologsSince={this.state.orthologsSince}
                         curatable={this.state.curatableGenomes}
                         width={1200}
                         allowGeneSelection={true}
                         pivotTree={true}
                         enablePhyloview={true}
                         enableCuration={true}
                         ensemblUrl='https://oryza-ensembl.gramene.org'
                         numberOfNeighbors={10}
                         getCuration={this.getCuration.bind(this)}
      />;
      form = <Feedback genetree={this.state.genetree._id} genes={this.state.submission} set={this.state.set}/>;
    }
    return (
      <div ref={this.myRef}>
        {geneInfo}
        {treeVis}
        {form}
      </div>
    )
  }
}

export default App;
