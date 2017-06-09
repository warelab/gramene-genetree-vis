import React from 'react';
import PositionedAlignment from '../PositionedAlignment.jsx';
import PositionedDomains from '../PositionedDomains.jsx';
import PositionedExonJunctions from '../PositionedExonJunctions.jsx';
import alignmentTools from '../../utils/calculateAlignment';
import positionDomains from '../../utils/positionDomains';

export default class MSASequence extends React.Component {
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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.colorScheme !== this.props.colorScheme) {
      // change the className - don't render again CSS will do the work
      let rows = document.getElementsByClassName(this.props.colorScheme);
      while (rows.length > 0) {
        rows[0].className = nextProps.colorScheme;
        // N.B. rows is a live set of DOM elements
        // which shrinks as you change className
      }
      return false;
    }
    return true;
  }

  handleSliderChange(e) {
    this.MSARange = {
      MSAStart: e,
      MSAStop: Math.min(e + Math.floor(this.props.width / this.charWidth), this.consensusLength)
    };
    let Xmin = e * this.charWidth;
    let rows = document.getElementsByClassName('MSAlignments-wrapper');
    rows[0].scrollLeft = Xmin;
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

  renderSequence(node) {
    if (node.model.gene_stable_id || !node.displayInfo.expanded) {
      let MSAProps = {
        key: node.model.node_id,
        className: this.props.colorScheme
      };
      let seq = node.model.consensus.sequence;
      let spans = []; // hold the lengths of each run
      let spanStart = 0;
      for (let i = 1; i < seq.length; i++) {
        if (seq[i] !== seq[spanStart]) {
          spans.push(i-spanStart);
          spanStart = i;
        }
      }
      spans.push(seq.length - spanStart);

      let offset=0;
      let gapCode = '-'.charCodeAt(0);
      let msaRow = [];
      for(let i=0;i<spans.length;i++) {
        let bases = String.fromCharCode.apply(this,seq.slice(offset,offset + spans[i]));
        let className = (seq[offset] === gapCode) ? 'gap' : bases.charAt(0);
        msaRow.push((<span key={i} className={className}>{bases}</span>));
        offset += spans[i];
      }
      return (
        <div {...MSAProps}>{msaRow}</div>
      );

    }
  }
  render() {
    let alignments = this.props.nodes.map(this.renderSequence.bind(this));
    let consensus = this.renderNode(this.props.rootNode);
    return (
      <g>
        <foreignObject x={this.props.xOffset}
                       y={this.props.controlsHeight}
                       width={this.props.width}
                       height={this.props.height + 2 * this.props.margin + 3}>
          <div className="MSAlignments-wrapper"
               onLoad={() => this.scrollLeft = this.MSARange.MSAStart * this.charWidth}>
            {alignments}
          </div>
        </foreignObject>
        <g className="viz-wrapper" transform={this.props.transform}>
          <g className="consensus-wrapper">
            <svg width={this.props.width}
                 height={this.props.controlsHeight}
                 viewBox={this.getViewBox(true)}
                 preserveAspectRatio="none">
              {consensus}
            </svg>
          </g>
        </g>
      </g>
    )
  }
}
