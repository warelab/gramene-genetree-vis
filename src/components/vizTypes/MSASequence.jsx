import React from 'react';
import PositionedAlignment from '../PositionedAlignment.jsx';
import PositionedDomains from '../PositionedDomains.jsx';
import alignmentTools from '../../utils/calculateAlignment';
import positionDomains from '../../utils/positionDomains';
import interact from 'interact.js';

export default class MSASequence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.zoomerRef = React.createRef();
    this.consensusLength = this.props.rootNode.model.consensus.sequence.length;
    this.charWidth = 7.2065;
    this.charsAtOnce = props.width / this.charWidth;
    this.windowWidth = props.width*props.width/(this.charWidth*this.consensusLength);
    this.MSARange = props.MSARange;
  }

  // componentWillMount() {
  // }

  dragMoveListener(event) {
    let target = event.target,
      x = this.props.width * this.MSARange.MSAStart/this.consensusLength + event.dx,
      y = parseFloat(target.getAttribute('data-y')) || 0;
    // respect boundaries
    if (x < 0) x = 0;
    if (x > this.props.width - this.windowWidth) x = this.props.width - this.windowWidth;
    // translate the element
    target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
    // update the position attribute
    target.setAttribute('data-x', x);
    // update the MSA position
    let Xmin = x * this.consensusLength/this.props.width;
    let rows = document.getElementsByClassName('MSAlignments-wrapper');
    rows[0].scrollLeft = Xmin * this.charWidth;
    this.MSARange.MSAStart = Xmin;
    this.MSARange.MSAStop = Xmin + this.charsAtOnce;
    this.props.handleRangeChange(this.MSARange);
  }

  componentDidMount() {
    let zoomer = this.zoomerRef.current;
    if (zoomer) {
      let x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
      let y = parseFloat(zoomer.getAttribute('data-y')) || 0;
      zoomer.style.webkitTransform =
        zoomer.style.transform =
          `translate(${x}px,${y}px)`;
      zoomer.style.width = this.windowWidth + 'px';
      let rows = document.getElementsByClassName('MSAlignments-wrapper');
      rows[0].scrollLeft = this.MSARange.MSAStart * this.charWidth;

      interact(zoomer)
        .draggable({
          onmove: this.dragMoveListener.bind(this)
        })
    }
  }

  componentDidUpdate() {
    let zoomer = this.zoomerRef.current;
    this.windowWidth = this.props.width * this.props.width / (this.charWidth * this.consensusLength);
    this.charsAtOnce = this.props.width / this.charWidth;
    let x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
    let y = parseFloat(zoomer.getAttribute('data-y')) || 0;
    zoomer.style.webkitTransform =
      zoomer.style.transform =
        `translate(${x}px,${y}px)`;
    let rows = document.getElementsByClassName('MSAlignments-wrapper');
    rows[0].scrollLeft = this.MSARange.MSAStart * this.charWidth;
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

  getViewBox() {
    let viewBoxMinX = 0;
    let viewBoxMinY = -3;
    let viewBoxWidth = this.consensusLength;
    let viewBoxHeight = this.props.controlsHeight;
    return `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;
  }

  renderNode(node) {
    let alignment = alignmentTools.calculateAlignment(node);
    let domains = positionDomains(node);
    return (
      <g key={node.model.node_id}>
        <PositionedAlignment node={node} width={this.props.width} stats={this.props.stats} domains={domains}
                             highlight={false} alignment={alignment}/>
        <PositionedDomains node={node} width={this.props.width} stats={this.props.stats} domains={domains}
                           alignment={alignment}/>
      </g>
    )
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

  renderControls() {
    return (
      <g>
        <g className="viz-wrapper" transform={`translate(${this.props.xOffset},3)`}>
          <svg width={this.props.width}
               height={this.props.controlsHeight}
               viewBox={this.getViewBox(true)}
               preserveAspectRatio="none">
            {this.renderNode(this.props.rootNode)}
          </svg>
        </g>
        <foreignObject x={this.props.xOffset}
                       y={this.props.yOffset}
                       width={this.props.width}
                       height={this.props.controlsHeight + 6}>
          <div className="resize-container">
            <div ref={this.zoomerRef} className="resize-drag" style={{height:this.props.controlsHeight + 6}}/>
          </div>
        </foreignObject>

      </g>
    )
  }

  renderMSA() {
    return (
      <foreignObject x={this.props.xOffset}
                     y={this.props.yOffset + this.props.controlsHeight + this.props.margin - 10}
                     width={this.props.width}
                     height={this.props.height + 2*this.props.margin + 3}>
        <div className="MSAlignments-wrapper">
          {this.props.nodes.map(this.renderSequence.bind(this))}
        </div>
      </foreignObject>
    )
  }

  render() {
    return (
      <g>
        {this.renderMSA()}
        {this.renderControls()}
      </g>
    )
  }
}
