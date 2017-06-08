import React from 'react';

const arrowLength = 10;
const arrowHeight = 4;
const neighborhoodHeight = 18;

const NeighborhoodArrow = props => {
  let lineLength = props.width;
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
        <NeighborhoodArrow strand={neighborhood.strand} width={this.props.width}/>
        {genes}
      </g>
    );
  }
}
