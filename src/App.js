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
    this.state = {
      curatableGenomes: {
        4577: 'B73',
        45770000: 'B73v4',
        4577004: 'CML247',
        4577007: 'CML333',
        4577008: 'CML52',
        4577012: 'Ki11',
        4577013: 'Ki3',
        4577014: 'Ky21',
        4577015: 'M162W',
        4577018: 'MS71',
        4577019: 'NC350',
        4558: 'sorghum'
      },
      submission: []
    }
  }
  componentDidMount() {
    const parsed = queryString.parse(window.location.search);
    if (!parsed.gene) {
      parsed.gene = defaults.gene;
    }
    let set = parsed.set || 'nam';
    let taxonomyPromise = GrameneTrees.promise.get();
    let orthologsSince=undefined;
    if (parsed.since) {
      orthologsSince = {};
      orthologsSince[parsed.since] = 'keep';
    }
    taxonomyPromise.then(function (taxonomy) {
      let genomesOfInterest = {
        3702: taxonomy.indices.id[3702],
        4558: taxonomy.indices.id[4558],
        4577: taxonomy.indices.id[4577],
        45770000: taxonomy.indices.id[45770000],
        4577004: taxonomy.indices.id[4577004],
        4577007: taxonomy.indices.id[4577007],
        4577008: taxonomy.indices.id[4577008],
        4577012: taxonomy.indices.id[4577012],
        4577013: taxonomy.indices.id[4577013],
        4577014: taxonomy.indices.id[4577014],
        4577015: taxonomy.indices.id[4577015],
        4577018: taxonomy.indices.id[4577018],
        4577019: taxonomy.indices.id[4577019],
        39947: taxonomy.indices.id[39947]
      };
      // if (taxonomy.indices.id[45770]) {
      //   genomesOfInterest[45770] = taxonomy.indices.id[45770];
      //   genomesOfInterest[4577000] = taxonomy.indices.id[4577000];
      //   genomesOfInterest = {};
      // }
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

    // Q.all([genePromise,treePromise]).spread(function(gene,tree) {
    //   let genetree = GrameneTrees.genetree.tree(tree);
    //   let geneOfInterest = gene[0];
    //   let submission = genetree.leafNodes()
    //     .filter(node => this.state.curatableGenomes.hasOwnProperty(node.model.taxon_id))
    //     .map(node => {return {geneId: node.model.gene_stable_id, opinion: 'okay'}});
    //   this.setState({genetree, geneOfInterest, submission});
    // }.bind(this));
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
                         ensemblUrl='http://ensembl.gramene.org'
                         numberOfNeighbors={10}
                         enableCuration={true}
                         getCuration={this.getCuration.bind(this)}
      />;
      form = <Feedback genetree={this.state.genetree._id} genes={this.state.submission} set={this.state.set}/>;
    }
    return (
      <div>
        {geneInfo}
        {treeVis}
        {form}
      </div>
    )
  }
}

export default App;
