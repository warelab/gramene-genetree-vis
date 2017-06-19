import React from 'react';
import _ from 'lodash';

const neighborhoodHeight = 24;

const NeighborhoodArrow = props => {
  const arrowLength = 10*props.totalLength/props.width;
  const arrowHeight = 4;
  let lineLength = props.totalLength;
  let lineStart = 0;
  let lineEnd = lineLength;
  let arrowHead;
  if (props.strand) {
    const flipped = (props.strand === 'reverse');
    lineStart = flipped ? arrowLength : 0;
    lineEnd = flipped ? lineLength : lineLength - arrowLength;
    const tipX = flipped ? 0 : lineLength;
    const tailX = flipped ? arrowLength : tipX - arrowLength;
    const tipY = neighborhoodHeight / 2;
    const points = `${tipX},${tipY} ${tailX},${tipY + arrowHeight} ${tailX},${tipY - arrowHeight}`;
    arrowHead = <polygon points={points}/>
  }
  let tickMarks = [];
  for(let i=1;i<lineLength; i++) {
    let tick = (
      <line
        x1={i} y1={4}
        x2={i} y2={20}
        stroke="black"
        strokeWidth="0.01"
        key={i}
      />
    );
    tickMarks.push(tick);
  }
  return (
    <g>
      <line
        x1={lineStart} y1={neighborhoodHeight / 2}
        x2={lineEnd} y2={neighborhoodHeight / 2}
        stroke="black"
        strokeWidth="2"
      />
      {tickMarks}
      {arrowHead}
    </g>
  );
};

const ComparaGene = props => {
  let gene = props.gene;
  return (
    <line
      x1={gene.x - 0.3} y1={4}
      x2={gene.x + 0.3} y2={20}
      stroke="green"
      strokeWidth="0.1"
    />
  )
};

const NonCodingGroup = props => {
  let x = +props.x;
  // let n = props.genes.length;
  return (
    <line
      x1={x - 0.3} y1={20}
      x2={x + 0.3} y2={4}
      stroke="red"
      strokeWidth="0.1"
    />
  )
};

export default class Neighborhood extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    let neighborhood = this.props.neighborhood;
    let comparaGenes = [];
    let nonCodingGeneGroup = {};
    let center_x = this.props.totalLength / 2;
    let centralGene = neighborhood.genes[neighborhood.center_idx];


    if (neighborhood.strand === 'reverse') {
      neighborhood.genes.forEach(function(gene) {
        gene.x = center_x - (centralGene.compara_idx - gene.compara_idx);
        if (gene.gene_tree) {
          comparaGenes.push(<ComparaGene gene={gene} key={gene.x}/>);
        }
        else { // non coding
          gene.x = center_x - (centralGene.compara_idx - gene.compara_idx + 0.5);
          if (!nonCodingGeneGroup.hasOwnProperty(gene.x)) {
            nonCodingGeneGroup[gene.x] = [];
          }
          nonCodingGeneGroup[gene.x].push(gene);
        }
      });
    }
    else { // forward
      neighborhood.genes.forEach(function(gene) {
        gene.x = center_x + (centralGene.compara_idx - gene.compara_idx);
        if (gene.gene_tree) {
          comparaGenes.push(<ComparaGene gene={gene} key={gene.x}/>);
        }
        else { // non coding
          gene.x = center_x + (centralGene.compara_idx - gene.compara_idx + 0.5);
          if (!nonCodingGeneGroup.hasOwnProperty(gene.x)) {
            nonCodingGeneGroup[gene.x] = [];
          }
          nonCodingGeneGroup[gene.x].push(gene);
        }
      });
    }
    let nonCodingGenes = [];
    for (let x in nonCodingGeneGroup) {
      console.log(x, nonCodingGeneGroup[x]);
      nonCodingGenes.push(<NonCodingGroup x={x} key={x}/>);
    }
    return (
      <g className="Neighborhood" >
        <NeighborhoodArrow strand={neighborhood.strand} width={this.props.width} totalLength={this.props.totalLength}/>
        {comparaGenes}
        {nonCodingGenes}
      </g>
    );
  }
}
