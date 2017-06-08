import React from 'react';
import PositionedAlignment from '../PositionedAlignment.jsx';
import PositionedDomains from '../PositionedDomains.jsx';
import PositionedExonJunctions from '../PositionedExonJunctions.jsx';
import alignmentTools from '../../utils/calculateAlignment';
import positionDomains from '../../utils/positionDomains';

export default class MSAOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {
    this.consensusLength = this.props.rootNode.model.consensus.sequence.length;
    this.charWidth = 7.2065;
    this.MSARange = {
      MSAStart: 0,
      MSAStop: this.consensusLength
    };
  }

  handleSliderChange(e) {
    this.MSARange = {MSAStart: e[0], MSAStop: e[1]};
    let MSAWidth = e[1] - e[0];
    let Xmin = e[0];
    let vb = `${Xmin} -3 ${MSAWidth} ${this.vbHeight}`;
    this.alignmentsSVG.setAttribute('viewBox', vb);
  }

  getViewBox(forConsensus) {
    let viewBoxMinX = forConsensus ? 0 : this.MSARange.MSAStart;
    let viewBoxMinY = -3;
    let viewBoxWidth = this.MSARange.MSAStop - this.MSARange.MSAStart;
    let viewBoxHeight = forConsensus ? this.props.controlsHeight : this.props.height + 2 * this.props.margin + 3;
    return `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;
  }

  renderNode(node) {
    if (node.model.gene_stable_id || !node.displayInfo.expanded) {
      let alignment = alignmentTools.calculateAlignment(node);
      let pej;
      if (node.model.exon_junctions) {
        pej = (
          <PositionedExonJunctions node={node} width={this.props.width} alignment={alignment}/>
        )
      }
      let domains = positionDomains(node);
      return (
        <g key={node.model.node_id}>
          {pej}
          <PositionedAlignment node={node} width={this.props.width} stats={this.props.stats} domains={domains}
                               highlight={false} alignment={alignment}/>
          <PositionedDomains node={node} width={this.props.width} stats={this.props.stats} domains={domains}
                             alignment={alignment}/>
        </g>
      )
    }
  }

  render() {
    let alignments = this.props.nodes.map(this.renderNode.bind(this));
    let consensus = this.renderNode(this.props.rootNode);
    return (
      <g>
        <g className="consensus-wrapper">
          <svg width={this.props.width}
               height={this.props.controlsHeight}
               viewBox={this.getViewBox(true)}
               preserveAspectRatio="none">
            {consensus}
          </svg>
        </g>
        <g className="alignments-wrapper" transform={`translate(0,${this.props.controlsHeight})`}>
          <svg ref={(svg) => this.alignmentsSVG = svg}
               width={this.props.width}
               height={this.props.height + 2 * this.props.margin + 3}
               viewBox={this.getViewBox(false)}
               preserveAspectRatio="none">
            {alignments}
         </svg>
       </g>
      </g>
    )
  }
}
