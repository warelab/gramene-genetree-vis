import _ from 'lodash';

function taxonomyColor(node) {
  let stats, colorScale, score;
  stats = _.get(node, 'relationToGeneOfInterest.taxonomy');
  if (stats) {
    score = stats.lcaDistance + stats.pathDistance;
    colorScale = stats.maxima.colorScale;
    return colorScale(score);
  }
}

export default taxonomyColor;