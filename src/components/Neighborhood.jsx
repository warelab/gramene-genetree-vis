'use strict';

var React = require('react');

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
    lineLength -= arrowLength;
  }
  return (
    <g>
      <line
        x1={lineStart} y1={neighborhoodHeight / 2}
        x2={lineEnd} y2={neighborhoodHeight / 2}
        stroke="black"
        strokeWidth="2"
      />
      {arrowHead}
    </g>
  );
};

var Neighborhood = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    neighborhood: React.PropTypes.object.isRequired
  },
    
  render: function () {
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
});

module.exports = Neighborhood;