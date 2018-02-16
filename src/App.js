import React, { Component } from 'react';
import './App.css';
import './styles/msa.css';
import './styles/tree.css';
import './styles/spinner.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import TreeVis from './components/TreeVis.jsx';

let geneFixture = require('./fixtures/YAB2_gene.json');

let GrameneTrees = require('gramene-trees-client');

let exampleGenetree = GrameneTrees.genetree.tree(require('./fixtures/YAB2_tree.json'));
let taxonomy = GrameneTrees.taxonomy.tree(require('./fixtures/taxonomy.json'));

let genomesOfInterest = {
  3702 : taxonomy.indices.id[3702],
  4558 : taxonomy.indices.id[4558],
  4577 : taxonomy.indices.id[4577],
  39947 : taxonomy.indices.id[39947]
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genetree: exampleGenetree,
      geneOfInterest: geneFixture,
      taxonomy: taxonomy,
      genomesOfInterest: genomesOfInterest,
      curatableGenomes: {4577: taxonomy.indices.id[4577]}
    };
  }
  getCuration(opinion) {
    console.log(opinion);
  }
  render() {
    if (this.state.genetree) {
      return <TreeVis genetree={this.state.genetree}
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
    else {
      return <div>tree</div>;
    }
  }
}

export default App;
