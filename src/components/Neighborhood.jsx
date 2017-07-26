import React from 'react';
import _ from 'lodash';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

import Gene from './Gene';

var d3Scale = require('d3-scale');

const neighborhoodHeight = 24;
const scaleFactor = 20;

const NeighborhoodArrow = props => {
  const arrowLength = scaleFactor * 10*props.totalLength/props.width;
  const arrowHeight = 4;
  let lineLength = scaleFactor * props.totalLength;
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
  for(let i=1*scaleFactor;i<lineLength; i+=scaleFactor) {
    let tick = (
      <line
        x1={i} y1={4}
        x2={i} y2={20}
        stroke="black"
        strokeWidth="0.5"
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

  const geneWidth = 0.6 * scaleFactor;
  const geneHeight = 16;

  const identityScale = d3Scale.scaleLinear()
    .domain([1,0])
    .range([props.color, 'white']);

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

  const centerStrokeLine = props.center
    ?  <line
        x1={gene.x*scaleFactor} y1={geneHeight / 4 - 2}
        x2={gene.x*scaleFactor} y2={geneHeight / 4 + geneHeight + 2}
        stroke="red"
        strokeWidth="1"
      />
    : null;

  const highlighted = props.highlighted[gene.tree_id];

  const identity = gene.relationToGeneOfInterest ? gene.relationToGeneOfInterest.identity : 1;
  return (
    <g>
      <Gene
        width={ geneWidth}
        height={ geneHeight}
        key={'H-' + gene.id}
        gene={gene}
        x={ gene.x*scaleFactor - (geneWidth) / 2 }
        y={ geneHeight / 4 }
        fillColor={ props.center ? identityScale(identity) : props.color }
        highlightColor={ highlighted ? 'cyan' : props.color }
        tooltip={ tooltip }
        highlighted={highlighted || props.center}
        opacity={undefined}
        clickHandler={ () => {
          if (props.clickHandler) {
            props.clickHandler(gene.id, gene.tree_id)
          }
        }}
      />
      { centerStrokeLine }

    </g>
  );

};

const NonCodingGroup = props => {

  let x = +props.x * scaleFactor;
  let n = props.genes.length;

  const ncgWidth = 0.3 * scaleFactor;
  const ncgHeight = 16;

  const tooltip = (
    <Tooltip id="tooltip">Non-coding group with { n } gene{ n > 1 ? 's' : ''}</Tooltip>
  );

  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <rect
        x={ x - ncgWidth / 2 }
        y={6}
        width={ ncgWidth }
        height={12}
        rx={ncgWidth / 6}
        ry={ncgHeight / 6}
        fill={ props.scale(n) } />
    </OverlayTrigger>
  );

  return (
    <line
      x1={x - 6} y1={20}
      x2={x + 6} y2={4}
      stroke="red"
      strokeWidth="1"
    />
  )
};

function treeIDToColor(tree_id, treeMap, scale) {

  if (tree_id === undefined) {
    return 'dimgray';
  }
  else if (treeMap[tree_id] === undefined) {
    return 'lightgray';
  }

  return scale(treeMap[tree_id]);
}

export default class Neighborhood extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {

    let comparaGenes = [];
    let nonCodingGenes = [];
    let neighborhood = this.props.neighborhood;
    if (neighborhood) {
      let nonCodingGeneGroup = {};
      let center_x = this.props.totalLength / 2;
      let centralGene = neighborhood.genes[neighborhood.center_idx];

      let treeInfo = this.props.treeInfo;

      if (neighborhood.strand === 'reverse') {
        neighborhood.genes.forEach((gene, gene_idx) => {
          gene.x = center_x - (centralGene.compara_idx - gene.compara_idx);
          if (gene.gene_tree) {
            const treeColor = treeIDToColor(gene.tree_id, treeInfo.treeMap, treeInfo.scale);
            comparaGenes.push(
              <ComparaGene
                gene={gene}
                key={gene.x}
                color={treeColor}
                center={gene_idx === neighborhood.center_idx}
                clickHandler={this.props.clickHandler}
                highlighted={this.props.highlighted}
              />
            );
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
        neighborhood.genes.forEach((gene, gene_idx) => {
          gene.x = center_x + (centralGene.compara_idx - gene.compara_idx);
          if (gene.gene_tree) {
            const treeColor = treeIDToColor(gene.tree_id, treeInfo.treeMap, treeInfo.scale);
            comparaGenes.push(
              <ComparaGene
                gene={gene}
                key={gene.x}
                color={treeColor}
                center={gene_idx === neighborhood.center_idx}
                clickHandler={this.props.clickHandler}
                highlighted={this.props.highlighted}
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


      const ncgScale = d3Scale.scaleLinear()
        .domain([this.props.maxNCGGenes, 1])
        .range(['#333333', 'lightgray']);

      for (let x in nonCodingGeneGroup) {
        nonCodingGenes.push(<NonCodingGroup x={x} key={x} genes={nonCodingGeneGroup[x]} scale={ncgScale}/>);
      }
    }

    return (
      <g className="Neighborhood" >
        <NeighborhoodArrow strand={neighborhood ? neighborhood.strand : undefined} width={this.props.width} totalLength={this.props.totalLength}/>
        {comparaGenes}
        {nonCodingGenes}
      </g>
    );
  }
}
