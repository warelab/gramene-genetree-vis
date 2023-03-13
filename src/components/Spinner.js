import React from 'react';

const Spinner = props =>
  <foreignObject x={props.xOffset} y={props.yOffset}>
    <div className="spinner">
      <div className="bounce1"></div>
      <div className="bounce2"></div>
      <div className="bounce3"></div>
    </div>
  </foreignObject>;

export default Spinner;
