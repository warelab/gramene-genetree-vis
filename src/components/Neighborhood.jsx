import React from 'react';

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
  return (
    <g>
      <line
        x1={lineStart} y1={neighborhoodHeight / 2}
        x2={lineEnd} y2={neighborhoodHeight / 2}
        stroke="black"
        strokeWidth="1"
      />
      {arrowHead}
    </g>
  );
};

export default class Neighborhood extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    let neighborhood = this.props.neighborhood;

    let genes = neighborhood.genes.map((gene, i) => {
    });
    return (
      <g className="Neighborhood" >
        <NeighborhoodArrow strand={neighborhood.strand} width={this.props.width} totalLength={this.props.totalLength}/>
        {genes}
      </g>
    );
  }
}
