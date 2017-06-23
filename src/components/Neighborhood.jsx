import React from 'react';
import _ from 'lodash';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

import Gene from './Gene';

var d3Scale = require('d3-scale');

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

  const gene = props.gene;

  const geneWidth = 0.6;
  const geneHeight = 16;

  const tooltipFields = [
    ['Gene ID',     gene.id],
    ['Gene Name',   gene.name],
    //['Taxonomy',    this.props.taxonomy.taxonIdToSpeciesName[gene.taxon_id]],
    ['Region',      gene.region + ':' + gene.start + '-' + gene.end],
    ['Tree ID',     gene.tree_id],
    //['Tree Root',   this.props.taxonomy.taxonIdToSpeciesName[gene.gene_tree_root_taxon_id]],
    ['Biotype',     gene.biotype],
    ['Description', gene.description]
  ];

  const tooltip = (
    <table>
      <tbody>
        {tooltipFields.map( (tip, i ) => {
          return (
            <tr key = {i} style={{verticalAlign : 'top'}}>
              <th>{tip[0]}</th>
              <td style={{color : 'lightgray'}}>{tip[1]}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );

  return (
    <Gene
      width={ geneWidth }
      height={ geneHeight }
      key={gene.id}
      gene={gene}
      x={ gene.x - geneWidth / 2 }
      y={ geneHeight / 4 }
      fillColor={ props.color }
      strokeColor={ 'blue' }
      tooltip={ tooltip }
    />
  );

};

const NonCodingGroup = props => {

  let x = +props.x;
  let n = props.genes.length;

  const ncgWidth = 0.35;
  const ncgHeight = 16;

  const tooltip = (
    <Tooltip id="tooltip">Non-coding group with { n } gene{ n > 1 ? 's' : ''}</Tooltip>
  );

  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <rect
        x={ x - ncgWidth / 2 }
        y={4}
        width={ ncgWidth }
        height={16}
        rx={ncgWidth / 6}
        ry={ncgHeight / 6}
        fill="gray"/>
    </OverlayTrigger>
  );

  return (
    <line
      x1={x - 0.3} y1={20}
      x2={x + 0.3} y2={4}
      stroke="red"
      strokeWidth="0.1"
    />
  )
};

function initTreeColors(primary_neighborhood) {
  let treeMap = {};
  let treeIdx = 0;

  var center_idx = Number(primary_neighborhood.center_idx);
  var right_of_idx = primary_neighborhood.genes.length - 1 - center_idx;

  var domain;
  var range = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'darkviolet'];

  //brute force the stupid edge cases.

  if (center_idx > 0 && right_of_idx > 0) {
    domain = [
      0,
      center_idx / 3,
      center_idx * 2 / 3,
      center_idx,
      center_idx + right_of_idx / 3,
      center_idx + right_of_idx * 2 / 3,
      primary_neighborhood.genes.length - 1
    ];

    //handle all the idiot edge cases if there are fewer than 7 genes
    if (center_idx == 1) {
      domain = domain.slice(3);
      domain.unshift(0);
      range = range.slice(2);
    }
    else if (center_idx == 2) {
      domain = domain.slice(3);
      domain.unshift(0, center_idx / 2);
      range = range.slice(1);
    }

    if (center_idx == primary_neighborhood.genes.length - 2) {
      domain = domain.slice(0, domain.length - 3);
      domain.push(primary_neighborhood.genes.length - 1);
      range = range.slice(0, range.length - 2);
    }
    else if (center_idx == primary_neighborhood.genes.length - 3) {
      domain = domain.slice(0, domain.length - 3);
      domain.push(center_idx + right_of_idx / 2, primary_neighborhood.genes.length - 1);
      range = range.slice(0, domain.length);
    }
    //done idiot edge cases

  }
  else if (center_idx == 0) {
    domain = [
      center_idx,
      center_idx + right_of_idx * 1 / 3,
      center_idx + right_of_idx * 2 / 3,
      primary_neighborhood.genes.length - 1
    ];
    range = ['green', 'blue', 'indigo', 'darkviolet'];
  }
  else {
    domain = [
      0,
      center_idx * 1 / 3,
      center_idx * 2 / 3,
      center_idx
    ];
    range = ['red', 'orange', 'yellow', 'green'];
  }

  var scale = d3Scale.scaleLinear()
    .domain(domain)
    .range(range);

  return {scale, treeMap, treeIdx};
}

function treeIDToColor(tree_id, offsetIdx, geneIdx, treeMap, scale) {
  if (tree_id == undefined) {
    return 'dimgray';
  }
  else if (treeMap[tree_id] == undefined) {
    if (offsetIdx == 0) {
      treeMap[tree_id] = geneIdx;
    }
    else {
      return 'lightgray';
    }
  }

  var color = scale(treeMap[tree_id]);

  return color;
}

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

    let treeInfo = {};
    if (neighborhood) {
      treeInfo = initTreeColors(neighborhood);
    }

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
      neighborhood.genes.forEach(function(gene, gene_idx) {
        gene.x = center_x + (centralGene.compara_idx - gene.compara_idx);
        if (gene.gene_tree) {
          const treeColor = treeIDToColor(gene.tree_id, 0, gene_idx, treeInfo.treeMap, treeInfo.scale);
          comparaGenes.push(
            <ComparaGene
              gene={gene}
              key={gene.x}
              color={treeColor}
              />
            );
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
      nonCodingGenes.push(<NonCodingGroup x={x} key={x} genes={nonCodingGeneGroup[x]}/>);
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
