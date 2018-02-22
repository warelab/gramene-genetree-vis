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
import Q from "q";
import _ from "lodash";

let GrameneTrees = require('gramene-trees-client');

let taxonomy = GrameneTrees.taxonomy.tree(require('./fixtures/taxonomy.json'));

let genomesOfInterest = {
  3702 : taxonomy.indices.id[3702],
  4558 : taxonomy.indices.id[4558],
  4577 : taxonomy.indices.id[4577],
  39947 : taxonomy.indices.id[39947]
};

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
      taxonomy: taxonomy,
      genomesOfInterest: genomesOfInterest,
      curatableGenomes: {4577: taxonomy.indices.id[4577]},
      submission: []
    };
  }
  componentDidMount() {
    const parsed = queryString.parse(window.location.search);
    if (!parsed.gene) {
      parsed.gene = defaults.gene;
    }
    if (!parsed.genetree) {
      parsed.genetree = defaults.genetree;
    }
    let genePromise = details('genes',parsed.gene);
    let treePromise = details('genetrees',parsed.genetree);

    Q.all([genePromise,treePromise]).spread(function(gene,tree) {
      let genetree = GrameneTrees.genetree.tree(tree);
      let geneOfInterest = gene[0];
      this.setState({genetree, geneOfInterest});
    }.bind(this));
  }
  getCuration(opinion) {
    let submission = [];
    for (const gene in opinion) {
      if (opinion[gene] !== 'okay') {
        submission.push({geneId: gene, opinion: opinion[gene]})
      }
    }
    this.setState({submission})
  }

  render() {
    let treeVis;
    if (this.state.genetree) {
      treeVis = <TreeVis genetree={this.state.genetree}
                         initialGeneOfInterest={this.state.geneOfInterest}
                         taxonomy={this.state.taxonomy}
                         genomesOfInterest={this.state.genomesOfInterest}
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
    }
    return (
      <div>
        {treeVis}
        <Feedback genetree={this.state.genetree._id} genes={this.state.submission}/>
      </div>
    )
  }
}

export default App;
