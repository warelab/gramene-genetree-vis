import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import taxonomyColor from '../../utils/taxonomyColor';

const Collapsed = props => {
  return (
    <g className="collapsed">
      {triangle(props.node)}
      {text(props.node)}
    </g>
  )
};

function text(node) {
  let texts, homologs, /*orthologs,*/ paralogs;
  homologs = node.leafNodes().length;
  //orthologs = _.get(node, 'displayInfo.orthologs.length') || 0;
  paralogs = _.get(node, 'displayInfo.paralogs.length') || 0;
  texts = [node.model.taxon_name + ': ' + homologs + ' genes'];

  addToTexts(paralogs, 'paralog');
  //addToTexts(orthologs, 'ortholog');

  function addToTexts(count, type) {
    let text, countText;
    if(count) {
      countText = count === homologs ? 'all' : count;
      text = countText + ' ' + type;
      if (count > 1) text += 's';
      texts.push(text);
    }
  }

  return <text x="36"
               dy=".35em">{texts.join(', ')}</text>;
}

function style(node) {
  let color = taxonomyColor(node);
  return {fill: color, stroke: color};
}

function triangle(node) {
  let d = 'M0,0 30,8 30,-8 0,0';

  return (
    <path d={d} style={style(node)}/>
  )
}

Collapsed.propTypes = {
  node: PropTypes.object.isRequired,
  onHover: PropTypes.func.isRequired
};

export default Collapsed;
