var _ = require('lodash');

function taxonomyColor(node) {
  var stats, colorScale, score;
  stats = _.get(node, 'relationToGeneOfInterest.taxonomy');
  if(stats) {
    score = stats.lcaDistance + stats.pathDistance;
    colorScale = stats.maxima.colorScale;
    return colorScale(score);
  }
}

module.exports = taxonomyColor;