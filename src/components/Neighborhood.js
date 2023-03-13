import React from 'react';
import {Tooltip, OverlayTrigger, Button} from 'react-bootstrap';

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
  let color = 'black';
  let tooltip = '<pre>internal node</pre>';
  if (props.neighborhood && props.neighborhood.strand) {
    const flipped = (props.neighborhood.strand === 'reverse');
    lineStart = flipped ? arrowLength : 0;
    lineEnd = flipped ? lineLength : lineLength - arrowLength;
    const tipX = flipped ? 0 : lineLength;
    const tailX = flipped ? arrowLength : tipX - arrowLength;
    const tipY = neighborhoodHeight / 2;
    const points = `${tipX},${tipY} ${tailX},${tipY + arrowHeight} ${tailX},${tipY - arrowHeight}`;
    color = props.neighborhood.region.color;
    arrowHead = <polygon points={points} stroke={color} fill={color}/>
    const region = props.neighborhood.region;
    const system_name=props.neighborhood.genes[0].system_name;
    let syntenyURL = `${props.ensemblUrl}/${system_name}/Location/Synteny?r=${region.name}:${region.start}-${region.end}`;
    let tooltipFields = [
      ['region', region.name],
      ['start', region.start],
      ['end', region.end],
      ['',<a href={syntenyURL} target='_blank' rel="noopener noreferrer">{`Synteny browser`}</a>]
    ];
    tooltip = (
      <Tooltip id={region.name + ':' + region.start}>
        <table>
          <tbody>
          {tooltipFields.map( (tip, i ) => {
            return (
              <tr key = {i} style={{verticalAlign : 'top'}}>
                <th>{tip[0]}</th>
                <td style={{color : 'lightgray', textAlign : 'left', paddingLeft : '15px'}}>{tip[1]}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </Tooltip>
    );
  }
  let tickMarks = [];
  for(let i=1*scaleFactor;i<lineLength; i+=scaleFactor) {
    let tick = (
      <line
        x1={i} y1={4}
        x2={i} y2={20}
        stroke={color}
        strokeWidth="0.25"
        key={i}
      />
    );
    tickMarks.push(tick);
  }
  return (
    <g>
      <OverlayTrigger placement="left" overlay={tooltip} trigger='click' rootClose={true}>
      <line
        x1={lineStart} y1={neighborhoodHeight / 2}
        x2={lineEnd} y2={neighborhoodHeight / 2}
        stroke={color}
        strokeWidth="3"
        cursor='pointer'
      />
      </OverlayTrigger>
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

  const identity = gene.relationToGeneOfInterest ? gene.relationToGeneOfInterest.identity : 1;

  const highlighted = props.highlighted[gene.tree_id];
  let syntenyURL = `${props.ensemblUrl}/${gene.system_name}/Location/Synteny?r=${gene.region}:${gene.start}-${gene.end}:${gene.orientation}`;
  let tooltipFields = [
    ['Gene ID',     <a href={`?idList=${gene.id}`} target='_blank' rel="noopener noreferrer">{gene.id}</a>],
    ['Gene Name',   gene.name],
    // ['Taxonomy',    props.taxonomy.taxonIdToSpeciesName[gene.taxon_id]],
    ['Region',      <a href = {syntenyURL} target='_blank' rel="noopener noreferrer">{`${gene.region}:${gene.start}-${gene.end}:${gene.orientation}`}</a>],
    ['Tree ID',     gene.tree_id],
    //['Tree Root',   this.props.taxonomy.taxonIdToSpeciesName[gene.gene_tree_root_taxon_id]],
    // ['Biotype',     gene.biotype],
    ['Description', gene.description]
  ];
  if (gene.closest_rep_id) {
    tooltipFields.push(['Homolog', gene.closest_rep_description]);
  }
  else if (gene.model_rep_id) {
    tooltipFields.push(['Homolog', gene.model_rep_description]);
  }
  let button = (
    <Button size={'sm'} onClick={() => {
      if (props.clickHandler) {
        props.clickHandler(gene.id, gene.tree_id)
      }
    }}>
      {highlighted ? 'Unhighlight' : 'Highlight'} this gene tree
    </Button>
  );
  if (gene.relationToGeneOfInterest) {
    tooltipFields.push(['Identity',Math.floor(1000*identity)/10 + '%']);
  }

  const tooltip = (
    <table>
      <tbody>
        {tooltipFields.map( (tip, i ) => {
          return (
            <tr key = {i} style={{verticalAlign : 'top'}}>
              <th>{tip[0]}</th>
              <td style={{color : 'lightgray', textAlign : 'left', paddingLeft : '15px'}}>{tip[1]}</td>
            </tr>
          )
        })}
        <tr style={{verticalAlign: 'top'}}>
          <td colSpan="2">{button}</td>
        </tr>
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

  return (
    <g>
      <Gene
        width={ geneWidth}
        height={ geneHeight}
        key={'H-' + gene.id}
        gene={gene}
        x={ gene.x*scaleFactor - (geneWidth) / 2 }
        y={ geneHeight / 4 }
        fillColor={ gene.relationToGeneOfInterest ? identityScale(identity) : props.color }
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
      else { // forward
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
                ensemblUrl={this.props.ensemblUrl}
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


      const ncgScale = d3Scale.scaleLinear()
        .domain([this.props.maxNCGGenes, 1])
        .range(['#333333', 'lightgray']);

      for (let x in nonCodingGeneGroup) {
        nonCodingGenes.push(<NonCodingGroup x={x} key={x} genes={nonCodingGeneGroup[x]} scale={ncgScale}/>);
      }
    }

    return (
      <g className="Neighborhood" >
        <NeighborhoodArrow ensemblUrl={this.props.ensemblUrl} neighborhood={neighborhood} width={this.props.width} totalLength={this.props.totalLength}/>
        {comparaGenes}
        {nonCodingGenes}
      </g>
    );
  }
}
