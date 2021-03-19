import React, { Component } from 'react';
import './App.css';
import './styles/msa.css';
import './styles/tree.css';
import './styles/spinner.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TreeVis from './components/TreeVis.jsx';
import Feedback from './Feedback';
import {client as searchInterface} from "gramene-search-client";
import queryString from 'query-string';
// import Q from "q";
import _ from "lodash";

let GrameneTrees = require('gramene-trees-client');

function details(collection, idList) {
  if (!_.isArray(idList)) {
    idList = [idList];
  }
  return searchInterface.grameneClient.then((client) =>
    client['Data access'][collection]({idList:idList,rows:-1}).then((response) => response.obj)
  );
}

const defaults = {
  gene: "AT1G08465",
  genetree: "EPlGT00140000000739"
};

class App extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      curatableGenomes: {
        4577:1,
        // 45770000:1,
        // 4558: 'BTx623 (JGI)',
        // 1000655996: 'tx430',
        // 1000651496: 'rio',
        // 1100004558: 'TX623 (CSHL)',
        // 1000656001: 'tx2783',
        // 1000561071: 'tx436'
        // 4577001:1,
        // 4577002:1,
        // 4577003:1,
        // 4577004:1,
        // 4577005:1,
        // 4577006:1,
        // 4577007:1,
        // 4577008:1,
        // 4577009:1,
        // 4577010:1,
        // 4577011:1,
        // 4577012:1,
        // 4577013:1,
        // 4577014:1,
        // 4577015:1,
        // 4577016:1,
        // 4577017:1,
        // 4577018:1,
        // 4577019:1,
        // 4577020:1,
        // 4577021:1,
        // 4577022:1,
        // 4577023:1,
        // 4577024:1,
        // 4577025:1
        // 3702: 'arabidopsis',
        // 39947: 'rice',
        // 4577: 'B73',
        // 45770000: 'B73v4',
        // 4577004: 'CML247',
        // 4577007: 'CML333',
        // 4577008: 'CML52',
        // 4577012: 'Ki11',
        // 4577013: 'Ki3',
        // 4577014: 'Ky21',
        // 4577015: 'M162W',
        // 4577018: 'MS71',
        // 4577019: 'NC350',
        // 4558: 'sorghum'
        // 29760: 'grapevine',
        // 15368: 'brachy'
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
    let set = parsed.set || 'sorghum1';
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
          let genetree = GrameneTrees.genetree.tree(tree);
          let submission = genetree.leafNodes()
            .filter(node => this.state.curatableGenomes.hasOwnProperty(node.model.taxon_id))
            .map(node => {
              return {geneId: node.model.gene_stable_id, opinion: 'curate'}
            });
          this.setState({genetree, geneOfInterest, submission, taxonomy, genomesOfInterest, set, orthologsSince});
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }
  getCuration(opinion,reason) {
    let submission = [];
    for (const gene in opinion) {
      let info = {geneId: gene, opinion: opinion[gene]};
      if (opinion[gene] === 'flag') {
        info.reason = reason[gene];
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
        <p>Mark genes as okay or flag genes that you think might have issues and choose a reason from the drop down menu. When finished, enter your email address and submit.</p>
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
                         ensemblUrl='http://maize-pangenone-ensembl.gramene.org'
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
